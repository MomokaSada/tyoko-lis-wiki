import { and, eq, ilike, isNotNull, or, sql, asc, desc as dsc } from 'drizzle-orm';
import { db } from '@/db';
import { contents, tags, categories, contentTags, contentCategories, contentEditLogs, contentEditLogTags, contentEditLogCategories, editSessions } from '@/db/schema';
import { escapeLikePattern } from './modules/escapeLike';

export type ContentSortKey = 'updatedAt' | 'createdAt' | 'viewCount' | 'title';
export type SortOrder = 'asc' | 'desc';

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

    const [createdLog] = await tx.insert(contentEditLogs).values({
      contentId: createdContent.id,
      deviceSessionId: data.deviceSessionId,
      userId: data.userId,
      revisionNumber: 1,
      type: 'snapshot',
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

export async function listVisibleContents(includeUnpublished: boolean, sort?: ContentSortKey, order?: SortOrder, limit?: number, offset?: number) {
  let query = db
    .select({
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
    .where(includeUnpublished ? undefined : eq(contents.isPublished, true))
    .orderBy(getOrderBy(sort, order));

  if (limit !== undefined) {
    query = query.limit(limit);
  }
  if (offset !== undefined) {
    query = query.offset(offset);
  }

  return query;
}

export async function countVisibleContents(queryText?: string, includeUnpublished?: boolean) {
  const visibilityClause = includeUnpublished ? undefined : eq(contents.isPublished, true);
  
  if (queryText) {
    const escapedQuery = escapeLikePattern(queryText);
    const [count] = await db
      .select({ count: sql<number>`count(distinct ${contents.id})` })
      .from(contents)
      .leftJoin(contentTags, eq(contents.id, contentTags.contentId))
      .leftJoin(tags, eq(contentTags.tagId, tags.id))
      .leftJoin(contentCategories, eq(contents.id, contentCategories.contentId))
      .leftJoin(categories, eq(contentCategories.categoryId, categories.id))
      .where(
        and(
          visibilityClause,
          or(
            ilike(contents.currentTitle, `%${escapedQuery}%`),
            ilike(contents.currentContent, `%${escapedQuery}%`),
            ilike(contents.slug, `%${escapedQuery}%`),
            ilike(tags.name, `%${escapedQuery}%`),
            ilike(categories.name, `%${escapedQuery}%`),
          ),
        ),
      );
    return count?.count ?? 0;
  }

  const [count] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contents)
    .where(visibilityClause);
  
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

export async function searchVisibleContents(queryText: string, includeUnpublished: boolean, sort?: ContentSortKey, order?: SortOrder, limit?: number, offset?: number) {
  const visibilityClause = includeUnpublished ? undefined : eq(contents.isPublished, true);
  const escapedQuery = escapeLikePattern(queryText);

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
    .where(
      and(
        visibilityClause,
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
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({
        latestRevision: contents.latestRevision,
      })
      .from(contents)
      .where(eq(contents.id, data.contentId))
      .limit(1);

    const nextRevision = (current?.latestRevision ?? 0) + 1;

    const [updatedContent] = await tx
      .update(contents)
      .set({
        slug: data.slug,
        currentTitle: data.title,
        currentContent: data.content,
        currentThumbnail: data.thumbnail,
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
      type: 'snapshot',
      title: data.title,
      data: data.content,
      thumbnail: data.thumbnail,
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
  const [updated] = await db
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
