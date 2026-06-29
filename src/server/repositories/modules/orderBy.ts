import { asc, desc } from 'drizzle-orm';
import { contents } from '@/db/schema';
import type { ContentSortKey, SortOrder } from '@/server/types/repositoryTypes';

export function getOrderBy(sort: ContentSortKey = 'updatedAt', order: SortOrder = 'desc') {
  const column = (() => {
    switch (sort) {
      case 'createdAt': return contents.createdAt;
      case 'viewCount': return contents.viewCount;
      case 'title': return contents.currentTitle;
      case 'updatedAt':
      default: return contents.updatedAt;
    }
  })();

  return order === 'asc' ? asc(column) : desc(column);
}
