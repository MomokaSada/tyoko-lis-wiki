/**
 * 一覧画面のクエリパラメータ用共通型定義
 *
 * 全管理画面・オーナー画面の一覧系ページで使用する。
 * URL クエリパラメータ（?page=1&sort=createdAt&order=desc&q=...）と 1:1 対応する。
 */

/** ソート順 */
export type SortOrder = 'asc' | 'desc';

/** ページネーションクエリ */
export type PaginationQuery = {
  page: number;
  limit: number;
};

/** ソートクエリ */
export type SortQuery<SortKey extends string = string> = {
  sortBy?: SortKey;
  sortOrder?: SortOrder;
};

/** 検索クエリ */
export type SearchQuery = {
  searchQuery?: string;
};

/** 一覧画面共通クエリ（ページネーション + ソート + 検索） */
export type ListQuery<SortKey extends string = string> = PaginationQuery &
  SortQuery<SortKey> &
  SearchQuery;

/** 一覧画面共通レスポンス（データ + 総件数） */
export type ListResult<T> = {
  items: T[];
  totalCount: number;
};

/** デフォルト値 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_SORT_ORDER: SortOrder = 'desc';

/** URL クエリパラメータから ListQuery をパースする */
export function parseListQuery<SortKey extends string>(
  searchParams: { [key: string]: string | string[] | undefined },
  validSortKeys: SortKey[],
  defaultSortBy: SortKey,
  defaultSortOrder?: SortOrder,
): ListQuery<SortKey> {
  const page =
    typeof searchParams.page === 'string'
      ? Math.max(1, parseInt(searchParams.page) || DEFAULT_PAGE)
      : DEFAULT_PAGE;

  const sortByRaw = typeof searchParams.sort === 'string' ? searchParams.sort : '';
  const sortBy = validSortKeys.includes(sortByRaw as SortKey)
    ? (sortByRaw as SortKey)
    : defaultSortBy;

  const sortOrder =
    typeof searchParams.order === 'string' && (searchParams.order === 'asc' || searchParams.order === 'desc')
      ? searchParams.order
      : (defaultSortOrder ?? DEFAULT_SORT_ORDER);

  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : undefined;

  return {
    page,
    limit: DEFAULT_LIMIT,
    sortBy,
    sortOrder,
    searchQuery,
  };
}
