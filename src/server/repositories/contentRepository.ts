import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  contentCategories,
  contentEditLogCategories,
  contentEditLogs,
  contentEditLogTags,
  contentTags,
  contents,
  editSessions,
} from '@/db/schema';

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

export async function listPublishedContents() {
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
    .orderBy(desc(contents.updatedAt));
}

export async function listVisibleContents(includeUnpublished: boolean) {
  return db
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
    .orderBy(desc(contents.updatedAt));
}

export async function searchPublishedContents(query: string) {
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
    .where(
      and(
        eq(contents.isPublished, true),
        or(
          ilike(contents.currentTitle, `%${query}%`),
          ilike(contents.currentContent, `%${query}%`),
          ilike(contents.slug, `%${query}%`),
        ),
      ),
    )
    .orderBy(desc(contents.updatedAt));
}

export async function searchVisibleContents(query: string, includeUnpublished: boolean) {
  const visibilityClause = includeUnpublished ? undefined : eq(contents.isPublished, true);

  return db
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
    .where(
      and(
        visibilityClause,
        or(
          ilike(contents.currentTitle, `%${query}%`),
          ilike(contents.currentContent, `%${query}%`),
          ilike(contents.slug, `%${query}%`),
        ),
      ),
    )
    .orderBy(desc(contents.updatedAt));
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
