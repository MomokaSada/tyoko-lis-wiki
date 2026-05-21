import { EditLinkForm } from './edit-link-form';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getEditLinks } from '@/server/services/editLinkService';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
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

function getUsageProgress(editsUsed: number, maxEdits: number) {
  const ratio = Math.min(1, maxEdits > 0 ? editsUsed / maxEdits : 0);
  let barClass = 'progress-emerald';
  if (ratio >= 1) barClass = 'progress-amber';
  else if (ratio >= 0.8) barClass = 'progress-amber';
  return { ratio, barClass };
}

export default async function EditLinksPage() {
  const actor = await getCurrentActor();
  const links = actor ? await getEditLinks(actor) : [];

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* ページヘッダー */}
        <div className="animate-float-in">
          <div className="relative bg-white border border-stone-200 rounded-[2rem] p-8 overflow-hidden shadow-sm">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
              <svg className="w-16 h-16 text-amber-400/30 ml-6 mt-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            </div>
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-7 bg-amber-500 rounded-full" />
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">記事編集リンク管理</h1>
              </div>
              <p className="text-stone-500 text-sm pl-4">記事やWikiの編集用の一時的なセッションリンクを発行します。</p>
            </div>
          </div>
        </div>

        {/* 新規発行フォーム */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-7 bg-amber-500 rounded-full" />
              <h2 className="text-xl font-black text-stone-800 tracking-tight">新しい編集リンクを発行</h2>
            </div>
            <EditLinkForm />
          </div>
        </div>

        {/* 発行済み編集リンク一覧 */}
        <div className="card">
          {/* ツールバー: 検索 + フィルター + 新規発行 */}
          <div className="px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="search-box">
                <svg className="search-box-icon w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input type="search" placeholder="リンクを検索..." className="search-box-input" />
              </div>
              <select className="field-select" style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 0.75rem', borderRadius: '0.875rem', fontSize: '0.75rem' }}>
                <option value="">すべて</option>
                <option value="active">アクティブ</option>
                <option value="expired">期限切れ</option>
                <option value="limit">利用制限到達</option>
              </select>
            </div>
            <Link
              href="#new-link-form"
              className="btn-primary btn-sm"
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
                const { ratio, barClass } = getUsageProgress(link.editsUsed, link.maxEdits);
                return (
                  <div
                    key={link.uuid}
                    className="px-6 py-4 hover:bg-amber-50/30 transition-colors"
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
                          <code className="text-sm font-mono text-stone-600 truncate max-w-md">
                            {`${process.env.NEXT_PUBLIC_APP_URL}/posts/create?session=${link.uuid}`}
                          </code>
                          <button className="btn-ghost btn-sm shrink-0">コピー</button>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          作成者: {link.authorName ?? `user:${link.authorId}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-stone-500 mb-1">使用率</p>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar" style={{ width: '80px' }}>
                              <div className={`progress-fill ${barClass}`} style={{ width: `${ratio * 100}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${ratio >= 1 ? 'text-amber-600' : 'text-stone-600'}`}>
                              {link.editsUsed}/{link.maxEdits}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {link.status === 'active' && (
                            <button className="btn-ghost btn-sm">失効</button>
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
          <div className="px-6 py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-stone-500">全 <strong className="text-stone-700">{links.length}</strong> 件</span>
            <div className="pagination">
              <button className="page-btn" disabled>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button className="page-btn active">1</button>
              <button className="page-btn">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
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
        hideProfile={true}
      />
    </>
  );
}
