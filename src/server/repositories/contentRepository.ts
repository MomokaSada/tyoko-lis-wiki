import { and, eq, ilike, isNotNull, or, sql, asc, desc as dsc, gte } from 'drizzle-orm';
import { db } from '@/db';
import { contents, tags, categories, contentTags, contentCategories, contentEditLogs, contentEditLogTags, contentEditLogCategories, editSessions, contentViewStats } from '@/db/schema';
import { escapeLikePattern } from './modules/escapeLike';
import { determineNextLogType } from './contentEditLogRepository';
import type { ContentSortKey, SortOrder } from '@/server/types/repositoryTypes';

function getOrderBy(sort: ContentSortKey = 'updatedAt', order: SortOrder = 'desc') {
  const column = (() => {
    switch (sort) {
      case 'createdAt': return contents.createdAt;
      case 'viewCount': return contents.viewCount;
      case 'title': return contents.currentTitle;
      case 'updatedAt':
      default: return contents.updatedAt;
    }
  })();

  return order === 'asc' ? asc(column) : dsc(column);
}

export async function findContentBySlug(slug: string) {
  const [content] = await db
    .select({
      id: contents.id,
      slug: contents.slug,
    })
    .from(contents)
    .where(eq(contents.slug, slug))
    .limit(1);

  return content ?? null;
}

export async function findContentSummaryById(contentId: number) {
  const [content] = await db
    .select({
      id: contents.id,
      slug: contents.slug,
      isPublished: contents.isPublished,
    })
    .from(contents)
    .where(eq(contents.id, contentId))
    .limit(1);

  return content ?? null;
}

export async function createContentWithInitialRevision(data: {
  slug: string;
  title: string;
  content: string;
  thumbnail: string | null;
  isPublished: boolean;
  userId: number | null;
  sessionId: string | null;
  deviceSessionId: number | null;
  tagIds: number[];
  categoryIds: number[];
  tagChanged: boolean;
  categoryChanged: boolean;
}) {
  return db.transaction(async (tx) => {
    const [createdContent] = await tx
      .insert(contents)
      .values({
        slug: data.slug,
        currentTitle: data.title,
        currentContent: data.content,
        currentThumbnail: data.thumbnail,
        latestRevision: 1,
        isPublished: data.isPublished,
      })
      .returning({
        id: contents.id,
        slug: contents.slug,
        currentTitle: contents.currentTitle,
      });

    const logType = await determineNextLogType(createdContent.id, 1);

    const [createdLog] = await tx.insert(contentEditLogs).values({
      contentId: createdContent.id,
      deviceSessionId: data.deviceSessionId,
      userId: data.userId,
      revisionNumber: 1,
      type: logType,
      title: data.title,
      data: data.content,
      thumbnail: data.thumbnail,
      tagChanged: data.tagChanged,
      categoryChanged: data.categoryChanged,
    }).returning({
      id: contentEditLogs.id,
    });

    if (data.tagIds.length > 0) {
      await tx.insert(contentTags).values(
        data.tagIds.map((tagId) => ({
          contentId: createdContent.id,
          tagId,
        })),
      );

      await tx.insert(contentEditLogTags).values(
        data.tagIds.map((tagId) => ({
          editLogId: createdLog.id,
          tagId,
        })),
      );
    }

    if (data.categoryIds.length > 0) {
      await tx.insert(contentCategories).values(
        data.categoryIds.map((categoryId) => ({
          contentId: createdContent.id,
          categoryId,
        })),
      );

      await tx.insert(contentEditLogCategories).values(
        data.categoryIds.map((categoryId) => ({
          editLogId: createdLog.id,
          categoryId,
        })),
      );
    }

    if (data.sessionId) {
      await tx
        .update(editSessions)
        .set({
          editsUsed: sql`${editSessions.editsUsed} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(editSessions.uuid, data.sessionId));
    }

    return createdContent;
  });
}

export async function listPublishedContents(sort?: ContentSortKey, order?: SortOrder) {
  return db
    .select({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
      content: contents.currentContent,
      thumbnail: contents.currentThumbnail,
      latestRevision: contents.latestRevision,
      viewCount: contents.viewCount,
      createdAt: contents.createdAt,
      updatedAt: contents.updatedAt,
    })
    .from(contents)
    .where(eq(contents.isPublished, true))
    .orderBy(getOrderBy(sort, order));
}

export async function listVisibleContents(includeUnpublished: boolean, sort?: ContentSortKey, order?: SortOrder, limit?: number, offset?: number, categoryId?: number) {
  const conditions: ReturnType<typeof eq>[] = [];
  
  if (!includeUnpublished) {
    conditions.push(eq(contents.isPublished, true));
  }

  let query = db
    .selectDistinct({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
      content: contents.currentContent,
      thumbnail: contents.currentThumbnail,
      latestRevision: contents.latestRevision,
      viewCount: contents.viewCount,
      isPublished: contents.isPublished,
      createdAt: contents.createdAt,
      updatedAt: contents.updatedAt,
    })
    .from(contents)
    .orderBy(getOrderBy(sort, order))
    .$dynamic();

  if (categoryId !== undefined) {
    query = query.leftJoin(contentCategories, eq(contents.id, contentCategories.contentId));
    conditions.push(eq(contentCategories.categoryId, categoryId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (limit !== undefined) {
    query = query.limit(limit);
  }
  if (offset !== undefined) {
    query = query.offset(offset);
  }

  return query;
}

export async function countVisibleContents(queryText?: string, includeUnpublished?: boolean, categoryId?: number) {
  const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof or>> = [];
  
  if (!includeUnpublished) {
    conditions.push(eq(contents.isPublished, true));
  }
  
  if (queryText) {
    const escapedQuery = escapeLikePattern(queryText);
    if (categoryId !== undefined) {
      conditions.push(eq(contentCategories.categoryId, categoryId));
    }
    conditions.push(
      or(
        ilike(contents.currentTitle, `%${escapedQuery}%`),
        ilike(contents.currentContent, `%${escapedQuery}%`),
        ilike(contents.slug, `%${escapedQuery}%`),
        ilike(tags.name, `%${escapedQuery}%`),
        ilike(categories.name, `%${escapedQuery}%`),
      ),
    );
    const [count] = await db
      .select({ count: sql<number>`count(distinct ${contents.id})` })
      .from(contents)
      .leftJoin(contentTags, eq(contents.id, contentTags.contentId))
      .leftJoin(tags, eq(contentTags.tagId, tags.id))
      .leftJoin(contentCategories, eq(contents.id, contentCategories.contentId))
      .leftJoin(categories, eq(contentCategories.categoryId, categories.id))
      .where(and(...conditions));
    return count?.count ?? 0;
  }

  if (categoryId !== undefined) {
    conditions.push(eq(contentCategories.categoryId, categoryId));
    const [count] = await db
      .select({ count: sql<number>`count(distinct ${contents.id})` })
      .from(contents)
      .leftJoin(contentCategories, eq(contents.id, contentCategories.contentId))
      .where(and(...conditions));
    return count?.count ?? 0;
  }

  const [count] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contents)
    .where(and(...conditions));
  
  return count?.count ?? 0;
}

export async function searchPublishedContents(query: string, sort?: ContentSortKey, order?: SortOrder) {
  const escapedQuery = escapeLikePattern(query);
  return db
    .selectDistinct({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
      content: contents.currentContent,
      thumbnail: contents.currentThumbnail,
      latestRevision: contents.latestRevision,
      viewCount: contents.viewCount,
      createdAt: contents.createdAt,
      updatedAt: contents.updatedAt,
    })
    .from(contents)
    .leftJoin(contentTags, eq(contents.id, contentTags.contentId))
    .leftJoin(tags, eq(contentTags.tagId, tags.id))
    .leftJoin(contentCategories, eq(contents.id, contentCategories.contentId))
    .leftJoin(categories, eq(contentCategories.categoryId, categories.id))
    .where(
      and(
        eq(contents.isPublished, true),
        or(
          ilike(contents.currentTitle, `%${escapedQuery}%`),
          ilike(contents.currentContent, `%${escapedQuery}%`),
          ilike(contents.slug, `%${escapedQuery}%`),
          ilike(tags.name, `%${escapedQuery}%`),
          ilike(categories.name, `%${escapedQuery}%`),
        ),
      ),
    )
    .orderBy(getOrderBy(sort, order));
}

export async function searchVisibleContents(queryText: string, includeUnpublished: boolean, sort?: ContentSortKey, order?: SortOrder, limit?: number, offset?: number, categoryId?: number) {
  const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof or>> = [];
  if (!includeUnpublished) {
    conditions.push(eq(contents.isPublished, true));
  }
  const escapedQuery = escapeLikePattern(queryText);

  conditions.push(
    or(
      ilike(contents.currentTitle, `%${escapedQuery}%`),
      ilike(contents.currentContent, `%${escapedQuery}%`),
      ilike(contents.slug, `%${escapedQuery}%`),
      ilike(tags.name, `%${escapedQuery}%`),
      ilike(categories.name, `%${escapedQuery}%`),
    ),
  );
  if (categoryId !== undefined) {
    conditions.push(eq(contentCategories.categoryId, categoryId));
  }

  let query = db
    .selectDistinct({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
      content: contents.currentContent,
      thumbnail: contents.currentThumbnail,
      latestRevision: contents.latestRevision,
      viewCount: contents.viewCount,
      isPublished: contents.isPublished,
      createdAt: contents.createdAt,
      updatedAt: contents.updatedAt,
    })
    .from(contents)
    .leftJoin(contentTags, eq(contents.id, contentTags.contentId))
    .leftJoin(tags, eq(contentTags.tagId, tags.id))
    .leftJoin(contentCategories, eq(contents.id, contentCategories.contentId))
    .leftJoin(categories, eq(contentCategories.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(getOrderBy(sort, order))
    .$dynamic();

  if (limit !== undefined) {
    query = query.limit(limit);
  }
  if (offset !== undefined) {
    query = query.offset(offset);
  }

  return query;
}

export async function findPublishedContentBySlug(slug: string) {
  const [content] = await db
    .select({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
      content: contents.currentContent,
      thumbnail: contents.currentThumbnail,
      latestRevision: contents.latestRevision,
      viewCount: contents.viewCount,
      createdAt: contents.createdAt,
      updatedAt: contents.updatedAt,
    })
    .from(contents)
    .where(and(eq(contents.slug, slug), eq(contents.isPublished, true)))
    .limit(1);

  return content ?? null;
}

export async function findEditableContentBySlug(slug: string) {
  const [content] = await db
    .select({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
      content: contents.currentContent,
      thumbnail: contents.currentThumbnail,
      isPublished: contents.isPublished,
      latestRevision: contents.latestRevision,
      viewCount: contents.viewCount,
      createdAt: contents.createdAt,
      updatedAt: contents.updatedAt,
    })
    .from(contents)
    .where(eq(contents.slug, slug))
    .limit(1);

  return content ?? null;
}

export async function updateContentWithRevision(data: {
  contentId: number;
  slug: string;
  title: string;
  content: string;
  thumbnail: string | null;
  isPublished: boolean;
  userId: number | null;
  sessionId: string | null;
  deviceSessionId: number | null;
  tagIds: number[];
  categoryIds: number[];
  tagChanged: boolean;
  categoryChanged: boolean;
}) {
  // トランザクションの外で type を事前判定（postgres-js の接続管理の都合）
  const [current] = await db
    .select({
      latestRevision: contents.latestRevision,
      currentThumbnail: contents.currentThumbnail,
    })
    .from(contents)
    .where(eq(contents.id, data.contentId))
    .limit(1);

  const nextRevision = (current?.latestRevision ?? 0) + 1;

  // スナップショット間隔に基づいて type を判定（diff10 → snapshot）
  const logType = await determineNextLogType(data.contentId, nextRevision);

  return db.transaction(async (tx) => {

    // data.thumbnail は常に明示的に指定される（string or null）
    // null は「削除」を意味するため、現在値をフォールバックしない
    const resolvedThumbnail = data.thumbnail ?? null;

    const [updatedContent] = await tx
      .update(contents)
      .set({
        slug: data.slug,
        currentTitle: data.title,
        currentContent: data.content,
        currentThumbnail: resolvedThumbnail,
        isPublished: data.isPublished,
        latestRevision: nextRevision,
        updatedAt: new Date(),
      })
      .where(eq(contents.id, data.contentId))
      .returning({
        id: contents.id,
        slug: contents.slug,
        title: contents.currentTitle,
        latestRevision: contents.latestRevision,
      });

    const [createdLog] = await tx.insert(contentEditLogs).values({
      contentId: updatedContent.id,
      deviceSessionId: data.deviceSessionId,
      userId: data.userId,
      revisionNumber: nextRevision,
      type: logType,
      title: data.title,
      data: data.content,
      thumbnail: resolvedThumbnail,
      tagChanged: data.tagChanged,
      categoryChanged: data.categoryChanged,
    }).returning({
      id: contentEditLogs.id,
    });

    if (data.tagChanged) {
      await tx.delete(contentTags).where(eq(contentTags.contentId, updatedContent.id));

      if (data.tagIds.length > 0) {
        await tx.insert(contentTags).values(
          data.tagIds.map((tagId) => ({
            contentId: updatedContent.id,
            tagId,
          })),
        );

        await tx.insert(contentEditLogTags).values(
          data.tagIds.map((tagId) => ({
            editLogId: createdLog.id,
            tagId,
          })),
        );
      }
    }

    if (data.categoryChanged) {
      await tx.delete(contentCategories).where(eq(contentCategories.contentId, updatedContent.id));

      if (data.categoryIds.length > 0) {
        await tx.insert(contentCategories).values(
          data.categoryIds.map((categoryId) => ({
            contentId: updatedContent.id,
            categoryId,
          })),
        );

        await tx.insert(contentEditLogCategories).values(
          data.categoryIds.map((categoryId) => ({
            editLogId: createdLog.id,
            categoryId,
          })),
        );
      }
    }

    if (data.sessionId) {
      await tx
        .update(editSessions)
        .set({
          editsUsed: sql`${editSessions.editsUsed} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(editSessions.uuid, data.sessionId));
    }

    return updatedContent;
  });
}

export async function deleteContentById(contentId: number) {
  const [deleted] = await db
    .delete(contents)
    .where(eq(contents.id, contentId))
    .returning({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
    });

  return deleted ?? null;
}

export async function incrementContentViewCount(contentId: number) {
  const today = new Date().toISOString().split('T')[0];

  return db.transaction(async (tx) => {
    await tx
      .insert(contentViewStats)
      .values({ contentId, date: today, viewCount: 1 })
      .onConflictDoUpdate({
        target: [contentViewStats.contentId, contentViewStats.date],
        set: { viewCount: sql`${contentViewStats.viewCount} + 1` },
      });

    const [updated] = await tx
      .update(contents)
      .set({
        viewCount: sql`${contents.viewCount} + 1`,
      })
      .where(eq(contents.id, contentId))
      .returning({
        id: contents.id,
        viewCount: contents.viewCount,
      });

    return updated ?? null;
  });
}

export async function getWeeklyPopularContents(limitCount = 6) {
  const oneWeekAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const oneWeekAgoStr = new Date(oneWeekAgoMs).toISOString().split('T')[0];

  return db
    .select({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
      thumbnail: contents.currentThumbnail,
      viewCount: sql<number>`cast(sum(${contentViewStats.viewCount}) as int)`,
      updatedAt: contents.updatedAt,
    })
    .from(contents)
    .innerJoin(contentViewStats, eq(contents.id, contentViewStats.contentId))
    .where(
      and(
        eq(contents.isPublished, true),
        gte(contentViewStats.date, oneWeekAgoStr)
      )
    )
    .groupBy(contents.id)
    .orderBy(dsc(sql`sum(${contentViewStats.viewCount})`))
    .limit(limitCount);
}

// ===== 純粋 CRUD 関数（トランザクション対応） =====
// ビジネスロジックを含まず、1テーブルに対する単一操作のみを行う。
// 既存の複合関数（createContentWithInitialRevision, updateContentWithRevision）は維持。
// 将来 Service 層でトランザクションを組み立てる際に使用する。

export async function insertContent(
  tx: any,
  data: {
    slug: string;
    currentTitle: string;
    currentContent: string;
    currentThumbnail: string | null;
    latestRevision: number;
    isPublished: boolean;
  },
) {
  const [created] = await tx
    .insert(contents)
    .values(data)
    .returning({
      id: contents.id,
      slug: contents.slug,
      currentTitle: contents.currentTitle,
    });
  return created;
}

export async function updateContentById(
  tx: any,
  contentId: number,
  data: {
    slug: string;
    currentTitle: string;
    currentContent: string;
    currentThumbnail: string | null;
    isPublished: boolean;
    latestRevision: number;
    updatedAt: Date;
  },
) {
  const [updated] = await tx
    .update(contents)
    .set(data)
    .where(eq(contents.id, contentId))
    .returning({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
      latestRevision: contents.latestRevision,
    });
  return updated;
}

export async function insertContentEditLog(
  tx: any,
  data: {
    contentId: number;
    deviceSessionId: number | null;
    userId: number | null;
    revisionNumber: number;
    type: 'snapshot' | 'diff';
    title: string;
    data: string;
    thumbnail: string | null;
    tagChanged: boolean;
    categoryChanged: boolean;
  },
) {
  const [created] = await tx
    .insert(contentEditLogs)
    .values(data)
    .returning({
      id: contentEditLogs.id,
    });
  return created;
}

export async function replaceContentTags(
  tx: any,
  contentId: number,
  tagIds: number[],
) {
  await tx.delete(contentTags).where(eq(contentTags.contentId, contentId));
  if (tagIds.length > 0) {
    await tx.insert(contentTags).values(
      tagIds.map((tagId) => ({ contentId, tagId })),
    );
  }
}

export async function replaceContentCategories(
  tx: any,
  contentId: number,
  categoryIds: number[],
) {
  await tx.delete(contentCategories).where(eq(contentCategories.contentId, contentId));
  if (categoryIds.length > 0) {
    await tx.insert(contentCategories).values(
      categoryIds.map((categoryId) => ({ contentId, categoryId })),
    );
  }
}

export async function insertContentEditLogTags(
  tx: any,
  editLogId: number,
  tagIds: number[],
) {
  if (tagIds.length > 0) {
    await tx.insert(contentEditLogTags).values(
      tagIds.map((tagId) => ({ editLogId, tagId })),
    );
  }
}

export async function insertContentEditLogCategories(
  tx: any,
  editLogId: number,
  categoryIds: number[],
) {
  if (categoryIds.length > 0) {
    await tx.insert(contentEditLogCategories).values(
      categoryIds.map((categoryId) => ({ editLogId, categoryId })),
    );
  }
}

export async function incrementEditSessionUsage(
  tx: any,
  sessionId: string,
) {
  await tx
    .update(editSessions)
    .set({
      editsUsed: sql`${editSessions.editsUsed} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(editSessions.uuid, sessionId));
}

/** コンテンツの現在のサムネイルを取得する */
export async function findCurrentThumbnail(
  contentId: number,
): Promise<string | null> {
  return db
    .select({ currentThumbnail: contents.currentThumbnail })
    .from(contents)
    .where(eq(contents.id, contentId))
    .limit(1)
    .then((rows) => rows[0]?.currentThumbnail ?? null);
}

export async function listReferencedThumbnailUrls() {
  const [contentRows, logRows] = await Promise.all([
    db
      .select({
        url: contents.currentThumbnail,
      })
      .from(contents)
      .where(isNotNull(contents.currentThumbnail)),
    db
      .select({
        url: contentEditLogs.thumbnail,
      })
      .from(contentEditLogs)
      .where(isNotNull(contentEditLogs.thumbnail)),
  ]);

  return [...contentRows, ...logRows].map((row) => row.url);
}
