import { AccountCreateLinkForm } from './account-create-link-form';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getAccountCreateLinks } from '@/server/services/accountCreateLinkService';
import type { AccountStatusFilter } from '@/server/repositories/accountCreateLinkRepository';
import { MobileActions } from '@/components/posts/MobileActions';
import { InvalidButton } from './invalid-button';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import { parseListQuery } from '@/types/listQuery';
import { SearchInput } from '@/components/ui/SearchInput';
import { CopyLinkButton } from '@/components/ui/CopyLinkButton';
import { SortControls } from '@/components/ui/SortControls';
import type { SortOption } from '@/components/ui/SortControls';
import { Pagination } from '@/components/ui/Pagination';
import { StatusFilterSelect } from './status-filter';
import Link from 'next/link';
import { Plus } from 'lucide-react';

function getStatusBadge(status: 'active' | 'expired' | 'inactive') {
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
        <span className="badge badge-red">
          <span className="badge-dot" />
          期限切れ
        </span>
      );
    case 'inactive':
      return (
        <span className="badge badge-stone">
          <span className="badge-dot" />
          無効化済み
        </span>
      );
  }
}

export default async function AccountCreateLinksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const actor = await getCurrentActor();

  const statusFilter: AccountStatusFilter | undefined =
    typeof searchParams.status === 'string' &&
    ['active', 'expired', 'inactive'].includes(searchParams.status)
      ? (searchParams.status as AccountStatusFilter)
      : undefined;

  const query = parseListQuery(searchParams, ['createdAt', 'endAt'], 'createdAt');
  const linksResult = actor ? await getAccountCreateLinks(actor, query, statusFilter) : { items: [], totalCount: 0 };
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
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 text-stone-900">
        {/* ページヘッダー */}
        <div className="animate-float-in">
          <div className="relative bg-white border border-stone-200 rounded-[2rem] p-8 overflow-hidden shadow-sm">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
              <svg className="w-16 h-16 text-blue-400/30 ml-6 mt-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-7 bg-blue-500 rounded-full" />
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">アカウント作成リンク管理</h1>
              </div>
              <p className="text-stone-500 text-sm pl-4">新規ユーザーの登録セッションリンクを発行・管理します。</p>
            </div>
          </div>
        </div>

        {/* 新規発行フォーム */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-7 bg-blue-500 rounded-full" />
              <h2 className="text-xl font-black text-stone-800 tracking-tight">新しいリンクを発行</h2>
            </div>
            <AccountCreateLinkForm />
          </div>
        </div>

        {/* 発行済みリンク一覧 */}
        <div className="card">
          {/* ツールバー: 検索 + フィルター */}
          <div className="px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SearchInput
                defaultValue={currentQ}
                sort={currentSort}
                order={currentOrder}
                basePath="/owner/account-create-links"
              />
              <StatusFilterSelect
                currentStatus={currentStatus}
                currentQ={currentQ}
                currentSort={currentSort}
                currentOrder={currentOrder}
              />
              <span className="hidden sm:block w-px h-5 bg-stone-200" />
              <SortControls
                basePath="/owner/account-create-links"
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
              className="btn-primary btn-sm"
              style={{
                background: '#3b82f6',
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <p className="text-stone-500 text-sm">まだ発行されたリンクはありません。</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {links.map((link) => (
                <div
                  key={link.uuid}
                  className="px-6 py-4 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(link.status)}
                        <span className="text-xs text-stone-400">
                          {link.startAt.toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-stone-600 font-mono">{link.uuid}</span>
                        <CopyLinkButton uuid={link.uuid} path="/auth/register?session=" />
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        作成者: {link.authorName ?? `user:${link.authorId}`} | 有効期限: {link.endAt.toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {link.status === 'active' && (
                        <InvalidButton uuid={link.uuid} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* フッター: ページネーション */}
          <div className="px-6 py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-stone-500">全 <strong className="text-stone-700">{totalCount}</strong> 件</span>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} pageUrl={pageUrl} />}
          </div>
        </div>

        <div className="pt-4">
          <Link href="/owner" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
            ← オーナー画面に戻る
          </Link>
        </div>
      </div>

      <MobileActions
        userRole={userRole}
        hasEditSession={hasEditSession}
        hideShare={true}
        hideProfile={true}
      />
    </>
  );
}
