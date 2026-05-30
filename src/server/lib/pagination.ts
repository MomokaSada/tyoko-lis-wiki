/**
 * ページネーション共通ユーティリティ。
 *
 * 各 Repository で重複している page/limit/offset の計算と
 * ページネーションメタデータの生成を共通化する。
 *
 * ## 使い方
 *
 * ```ts
 * const { page, limit, offset } = getPaginationParams(query);
 *
 * const rows = await db.select(...).limit(limit).offset(offset);
 * const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(...);
 *
 * return {
 *   rows,
 *   pagination: createPaginationMeta(countResult.count, page, limit),
 * };
 * ```
 */

export type PaginationInput = {
  page?: number;
  limit?: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * クエリパラメータから page / limit / offset を計算する。
 * デフォルトは page=1, limit=20。
 */
export function getPaginationParams(
  input?: PaginationInput,
): { page: number; limit: number; offset: number } {
  const page = Math.max(1, input?.page ?? 1);
  const limit = Math.max(1, Math.min(100, input?.limit ?? 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * ページネーションメタデータを生成する。
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: total > 0 ? Math.ceil(total / limit) : 0,
  };
}
