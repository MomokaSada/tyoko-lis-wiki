import { and, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { contents, tags, categories, contentTags, contentCategories } from '@/db/schema';
import { escapeLikePattern } from './escapeLike';
import { getOrderBy } from './orderBy';
import type { ContentSortKey, SortOrder } from '@/server/types/repositoryTypes';

export const visibleContentColumns = {
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
} as const;

export type VisibleContentColumn = keyof typeof visibleContentColumns;

function buildVisibilityCondition(includeUnpublished: boolean) {
  const conditions: ReturnType<typeof eq>[] = [];
  if (!includeUnpublished) {
    conditions.push(eq(contents.isPublished, true));
  }
  return conditions;
}

function buildSearchCondition(queryText: string) {
  const escapedQuery = escapeLikePattern(queryText);
  return or(
    ilike(contents.currentTitle, `%${escapedQuery}%`),
    ilike(contents.currentContent, `%${escapedQuery}%`),
    ilike(contents.slug, `%${escapedQuery}%`),
    ilike(tags.name, `%${escapedQuery}%`),
    ilike(categories.name, `%${escapedQuery}%`),
  );
}

export function buildContentListQuery(
  includeUnpublished: boolean,
  sort?: ContentSortKey,
  order?: SortOrder,
) {
  const conditions = buildVisibilityCondition(includeUnpublished);

  let query = db
    .selectDistinct(visibleContentColumns)
    .from(contents)
    .orderBy(getOrderBy(sort, order))
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return { query, conditions };
}

export function buildCountQuery(
  queryText?: string,
  includeUnpublished?: boolean,
  categoryId?: number,
) {
  const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof or>> = [];
  let needsJoin = false;

  if (!includeUnpublished) {
    conditions.push(eq(contents.isPublished, true));
  }

  if (queryText) {
    conditions.push(buildSearchCondition(queryText));
    needsJoin = true;
  }

  if (categoryId !== undefined) {
    conditions.push(eq(contentCategories.categoryId, categoryId));
    needsJoin = true;
  }

  let query = db
    .select({ count: sql<number>`count(${needsJoin ? sql`distinct ${contents.id}` : sql`*`})` })
    .from(contents)
    .$dynamic();

  if (needsJoin) {
    query = query
      .leftJoin(contentTags, eq(contents.id, contentTags.contentId))
      .leftJoin(tags, eq(contentTags.tagId, tags.id))
      .leftJoin(contentCategories, eq(contents.id, contentCategories.contentId))
      .leftJoin(categories, eq(contentCategories.categoryId, categories.id));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query;
}
