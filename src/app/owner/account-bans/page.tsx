import { BanButton, UnbanButton } from './ban-unban-buttons';
import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getManageableAccounts } from '@/server/services/accountBanService';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import Link from 'next/link';
import { UserX, AlertTriangle } from 'lucide-react';

function getAvatarStyle(name: string) {
  const colors = ['avatar-amber', 'avatar-emerald', 'avatar-blue', 'avatar-purple', 'avatar-stone'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default async function AccountBansPage() {
  const actor = await getCurrentActor();
  const isOwner = actor?.role === 'owner';
  const accounts = actor ? await getManageableAccounts(actor) : [];

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
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-red-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
              <UserX className="w-16 h-16 text-red-400/30 ml-6 mt-6" />
            </div>
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-7 bg-red-600 rounded-full" />
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">アカウントBAN管理</h1>
              </div>
              <p className="text-stone-500 text-sm pl-4">強制ログアウト・再ログイン抑止中のアカウント</p>
            </div>
          </div>
        </div>

        {!isOwner ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            この機能は owner のみ利用できます。
          </div>
        ) : (
          <div className="card">
            {/* ツールバー: 検索 + フィルター */}
            <div className="px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="search-box">
                <svg className="search-box-icon w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input type="search" placeholder="アカウントを検索..." className="search-box-input" />
              </div>
              <select className="field-select" style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 0.75rem', borderRadius: '0.875rem', fontSize: '0.75rem' }}>
                <option value="">すべて</option>
                <option value="banned">BAN中</option>
                <option value="active">アクティブ</option>
              </select>
            </div>

            {accounts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <UserX className="w-6 h-6" />
                </div>
                <p className="text-stone-500 text-sm">BAN対象の（または管理可能な）アカウントはありません。</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>アカウント</th>
                      <th>ステータス</th>
                      <th>登録日</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => {
                      const initial = account.name.charAt(0).toUpperCase() + (account.name.charAt(1) || '').toLowerCase();
                      const avatarColor = getAvatarStyle(account.name);
                      return (
                        <tr key={account.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className={`avatar ${avatarColor}`}>{initial}</div>
                              <span className="font-bold text-stone-800">{account.name}</span>
                            </div>
                          </td>
                          <td>
                            {account.isActive ? (
                              <span className="badge badge-stone">
                                <span className="badge-dot" />
                                アクティブ
                              </span>
                            ) : (
                              <span className="badge badge-red">
                                <span className="badge-dot" />
                                BAN中
                              </span>
                            )}
                          </td>
                          <td className="text-sm text-stone-500">
                            {formatDateTimeJst(account.createdAt).split(' ')[0]}
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button className="btn-ghost btn-sm">詳細</button>
                              {account.isActive ? (
                                <BanButton userId={account.id} />
                              ) : (
                                <UnbanButton userId={account.id} />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* フッター: ページネーション */}
            <div className="px-6 py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-stone-500">全 <strong className="text-stone-700">{accounts.length}</strong> 件</span>
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
        )}

        <div className="pt-8">
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
