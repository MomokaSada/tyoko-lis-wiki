import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { contentEditLogs, contents, editSessions } from '@/db/schema';

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

export async function createContentWithInitialRevision(data: {
  slug: string;
  title: string;
  content: string;
  thumbnail: string;
  isPublished: boolean;
  userId: number | null;
  sessionId: string | null;
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

    await tx.insert(contentEditLogs).values({
      contentId: createdContent.id,
      deviceSessionId: null,
      userId: data.userId,
      revisionNumber: 1,
      type: 'snapshot',
      title: data.title,
      data: data.content,
      thumbnail: data.thumbnail,
      tagChanged: false,
      categoryChanged: false,
    });

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
      createdAt: contents.createdAt,
      updatedAt: contents.updatedAt,
    })
    .from(contents)
    .where(eq(contents.isPublished, true))
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

export async function findPublishedContentBySlug(slug: string) {
  const [content] = await db
    .select({
      id: contents.id,
      slug: contents.slug,
      title: contents.currentTitle,
      content: contents.currentContent,
      thumbnail: contents.currentThumbnail,
      latestRevision: contents.latestRevision,
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
  thumbnail: string;
  isPublished: boolean;
  userId: number | null;
  sessionId: string | null;
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

    await tx.insert(contentEditLogs).values({
      contentId: updatedContent.id,
      deviceSessionId: null,
      userId: data.userId,
      revisionNumber: nextRevision,
      type: 'snapshot',
      title: data.title,
      data: data.content,
      thumbnail: data.thumbnail,
      tagChanged: false,
      categoryChanged: false,
    });

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
