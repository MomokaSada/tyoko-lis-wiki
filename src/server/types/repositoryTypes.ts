/**
 * リポジトリ層で使用される共有型定義。
 *
 * 従来これらの型は各 Repository ファイルで定義されていたが、
 * ページ層が Repository の型を直接 import する層違反（V8）を解消するために分離した。
 *
 * ページ層はこのファイルから型を import し、
 * Repository 層もこのファイルの型を内部で使用する。
 */

/** 編集リンクのステータスフィルター */
export type StatusFilter = 'active' | 'expired' | 'inactive' | 'limit-reached';

/** アカウント作成リンクのステータスフィルター */
export type AccountStatusFilter = 'active' | 'expired' | 'inactive';

/** コンテンツ一覧のソートキー */
export type ContentSortKey = 'updatedAt' | 'createdAt' | 'viewCount' | 'title';

/** ソート順 */
export type SortOrder = 'asc' | 'desc';
