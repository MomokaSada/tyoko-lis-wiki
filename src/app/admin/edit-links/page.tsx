import { EditLinkForm } from './edit-link-form';
import { DeactivateEditLinkButton } from './deactivate-button';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getCurrentEditor } from '@/server/lib/currentEditor';

import { getEditLinks } from '@/server/services/editLinkService';
import { StatusFilter } from '@/server/repositories/editLinkRepository';
import { MobileActions } from '@/components/layout/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';

import { parseListQuery } from '@/types/listQuery';
import { SearchInput } from '@/components/ui/SearchInput';
import { CopyLinkButton } from '@/components/ui/CopyLinkButton';
import { SortControls } from '@/components/ui/SortControls';
import type { SortOption } from '@/components/ui/SortControls';
import { StatusFilterSelect } from './status-filter';
import { formatDateTimeJp } from '@/lib/format/formatDateTime';
import { Pagination } from '@/components/ui/Pagination';
import Link from 'next/link';
import { Plus } from 'lucide-react';

function getStatusBadge(status: 'active' | 'expired' | 'inactive' | 'limit-reached') {
  switch (status) {
    case 'active':
      return (
        <span className="badge badge-emerald">
          <span className="badge-dot" />
          アクティブ
        </span>
      );
    case 'expired':
      return (
        <span className="badge badge-stone">
          <span className="badge-dot" />
          期限切れ
        </span>
      );
    case 'inactive':
      return (
        <span className="badge badge-stone">
          <span className="badge-dot" />
          期限切れ
        </span>
      );
    case 'limit-reached':
      return (
        <span className="badge badge-amber">
          <span className="badge-dot" />
          利用制限到達
        </span>
      );
  }
}

/** 使用率に応じた色を返す（0%→緑, 50%→琥珀, 75%→オレンジ, 100%→赤） */
function getUsageColor(editsUsed: number, maxEdits: number): { ratio: number; color: string } {
  const ratio = Math.min(1, maxEdits > 0 ? editsUsed / maxEdits : 0);
  // 3 色のグラデーションキーフレーム間で線形補間
  const stops: [number, number, number, number][] = [
    [0.00, 0x10, 0xb9, 0x81], // 緑
    [0.50, 0xf5, 0x9e, 0x0b], // 琥珀
    [1.00, 0xef, 0x44, 0x44], // 赤
  ];
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

  let color = '#10b981';
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, r0, g0, b0] = stops[i];
    const [t1, r1, g1, b1] = stops[i + 1];
    if (ratio >= t0 && ratio <= t1) {
      const p = (ratio - t0) / (t1 - t0);
      color = `#${hex(r0 + (r1 - r0) * p)}${hex(g0 + (g1 - g0) * p)}${hex(b0 + (b1 - b0) * p)}`;
      break;
    }
  }
  return { ratio, color };
}

export default async function EditLinksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const actor = await getCurrentActor();

  const statusFilter: StatusFilter | undefined =
    typeof searchParams.status === 'string' &&
    ['active', 'expired', 'inactive', 'limit-reached'].includes(searchParams.status)
      ? (searchParams.status as StatusFilter)
      : undefined;

  const query = parseListQuery(searchParams, ['createdAt', 'endAt', 'editsUsed'], 'createdAt');
  const linksResult = actor ? await getEditLinks(actor, query, statusFilter) : { items: [], totalCount: 0 };
  const links = linksResult.items;
  const totalCount = linksResult.totalCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / query.limit));

  const currentSort = query.sortBy ?? 'createdAt';
  const currentOrder = query.sortOrder ?? 'desc';
  const currentQ = query.searchQuery ?? '';
  const currentPage = query.page;
  const currentStatus = statusFilter ?? 'all';

  const sortOptions: SortOption[] = [
    { key: 'createdAt', label: '作成日' },
    { key: 'endAt', label: '期限' },
    { key: 'editsUsed', label: '使用回数' },
  ];

  function pageUrl(page: number): string {
    const params = new URLSearchParams();
    if (currentQ) params.set('q', currentQ);
    if (currentStatus !== 'all') params.set('status', currentStatus);
    if (currentSort !== 'createdAt') params.set('sort', currentSort);
    if (currentOrder !== 'desc') params.set('order', currentOrder);
    params.set('page', String(page));
    return `?${params.toString()}`;
  }

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* ページヘッダー */}
        <div className="animate-float-in">
          <div className="relative bg-white border border-stone-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 overflow-hidden shadow-sm">
            <div className="absolute -top-12 sm:-top-12 -left-12 sm:-left-12 w-28 sm:w-36 h-28 sm:h-36 bg-amber-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
              <svg className="w-14 sm:w-16 h-14 sm:h-16 text-amber-400/30 ml-5 sm:ml-6 mt-5 sm:mt-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            </div>
            <div className="absolute -right-8 sm:-right-10 -bottom-8 sm:-bottom-10 w-24 sm:w-28 h-24 sm:h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-1 sm:w-1.5 h-6 sm:h-7 bg-amber-500 rounded-full shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">項目編集リンク管理</h1>
              </div>
              <p className="text-stone-500 text-sm pl-3 sm:pl-4">項目やWikiの編集用の一時的なセッションリンクを発行します。</p>
            </div>
          </div>
        </div>

        {/* 新規発行フォーム */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-1 sm:w-1.5 h-6 sm:h-7 bg-amber-500 rounded-full shrink-0" />
              <h2 className="text-lg sm:text-xl font-black text-stone-800 tracking-tight">新しい編集リンクを発行</h2>
            </div>
            <EditLinkForm />
          </div>
        </div>

        {/* 発行済み編集リンク一覧 */}
        <div className="card">
          {/* ツールバー: 検索 + フィルター + 新規発行 */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <SearchInput defaultValue={currentQ} sort={currentSort} order={currentOrder} basePath="/admin/edit-links">
                {currentStatus !== 'all' && <input type="hidden" name="status" value={currentStatus} />}
              </SearchInput>

              {/* ステータスフィルター */}
              <StatusFilterSelect
                currentStatus={currentStatus}
                currentQ={currentQ}
                currentSort={currentSort}
                currentOrder={currentOrder}
              />
              <span className="hidden sm:block w-px h-5 bg-stone-200" />
              <SortControls
                basePath="/admin/edit-links"
                options={sortOptions}
                currentSort={currentSort}
                currentOrder={currentOrder}
                extraParams={{
                  ...(currentQ ? { q: currentQ } : {}),
                  ...(currentStatus !== 'all' ? { status: currentStatus } : {}),
                }}
              />
            </div>
            <Link
              href="#new-link-form"
              className="btn-primary btn-sm self-start"
              style={{
                background: '#f59e0b',
                color: 'white',
                fontWeight: 700,
                borderRadius: '0.625rem',
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <Plus className="w-4 h-4" />
              新規発行
            </Link>
          </div>

          {/* リンク一覧 */}
          {links.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              </div>
              <p className="text-stone-500 text-sm">まだ発行された編集リンクはありません。</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {links.map((link) => {
                const { ratio, color } = getUsageColor(link.editsUsed, link.maxEdits);
                return (
                  <div
                    key={link.uuid}
                    className="px-4 sm:px-6 py-4 hover:bg-amber-50/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getStatusBadge(link.status)}
                          <span className="text-[10px] sm:text-xs text-stone-400">
                            {formatDateTimeJp(link.startAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm text-stone-600 font-mono truncate max-w-full sm:max-w-[200px]">{link.uuid}</span>
                          <CopyLinkButton uuid={link.uuid} path="/posts/create?session=" />
                        </div>
                        <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5">
                          作成者: {link.authorName ?? `user:${link.authorId}`} | 使用: {link.editsUsed}/{link.maxEdits}回
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] sm:text-xs text-stone-500 mb-1">使用率</p>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar" style={{ width: '64px' }}>
                              <div className="progress-fill" style={{ width: `${ratio * 100}%`, background: color }} />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold" style={{ color }}>
                              {link.editsUsed}/{link.maxEdits}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {link.status === 'active' && (
                            <DeactivateEditLinkButton uuid={link.uuid} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* フッター: ページネーション */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <span className="text-sm text-stone-500">全 <strong className="text-stone-700">{totalCount}</strong> 件</span>
              {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} pageUrl={pageUrl} />}
          </div>
        </div>

        <div className="pt-4">
          <Link href="/admin" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
            ← 管理画面に戻る
          </Link>
        </div>
      </div>

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
      />
    </>
  );
}
