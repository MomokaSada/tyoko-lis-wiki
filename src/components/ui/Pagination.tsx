import Link from 'next/link';

type Props = {
  currentPage: number;
  totalPages: number;
  pageUrl: (page: number) => string;
};

/**
 * 一覧画面用のページネーションコンポーネント。
 * 全管理画面・オーナー画面で共通して使う。
 *
 * 使い方:
 * ```tsx
 * <Pagination currentPage={query.page} totalPages={totalPages} pageUrl={pageUrl} />
 * ```
 */
export function Pagination({ currentPage, totalPages, pageUrl }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <Link
        href={pageUrl(Math.max(1, currentPage - 1))}
        className={`page-btn ${currentPage <= 1 ? 'disabled' : ''}`}
        style={currentPage <= 1 ? { opacity: 0.4, pointerEvents: 'none', cursor: 'default' } : {}}
        aria-label="前のページ"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
      </Link>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
        .map((p, idx, arr) => (
          <span key={p} className="contents">
            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="page-ellipsis">...</span>}
            <Link href={pageUrl(p)} className={`page-btn ${p === currentPage ? 'active' : ''}`}>
              {p}
            </Link>
          </span>
        ))}
      <Link
        href={pageUrl(Math.min(totalPages, currentPage + 1))}
        className={`page-btn ${currentPage >= totalPages ? 'disabled' : ''}`}
        style={currentPage >= totalPages ? { opacity: 0.4, pointerEvents: 'none', cursor: 'default' } : {}}
        aria-label="次のページ"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
      </Link>
    </div>
  );
}
