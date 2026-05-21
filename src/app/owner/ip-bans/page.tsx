import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getActiveIpBans, getIpDeviceRecords } from '@/server/services/ipBanService';
import { IpBanForm } from './ip-ban-form';
import { UnIpBanButton } from './un-ip-ban-button';
import Link from 'next/link';
import { ShieldBan, AlertTriangle } from 'lucide-react';

export default async function IpBansPage() {
  const actor = await getCurrentActor();
  const bans = actor ? await getActiveIpBans(actor) : [];
  const records = actor ? await getIpDeviceRecords(actor) : [];
  const isOwner = actor?.role === 'owner';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 text-stone-900">
      {/* ページヘッダー */}
      <div className="animate-float-in">
        <div className="relative bg-white border border-stone-200 rounded-[2rem] p-8 overflow-hidden shadow-sm">
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-50 rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-inner pointer-events-none">
            <ShieldBan className="w-16 h-16 text-amber-400/30 ml-6 mt-6" />
          </div>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-stone-50 rounded-full opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-7 bg-amber-500 rounded-full" />
              <h1 className="text-3xl font-black text-stone-900 tracking-tight">IP BAN 管理</h1>
            </div>
            <p className="text-stone-500 text-sm pl-4">悪意のあるアクセスをIP単位でブロックします。</p>
          </div>
        </div>
      </div>

      {!isOwner ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          この機能は owner のみ利用できます。
        </div>
      ) : (
        <>
          {/* IP BAN 登録フォーム */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-7 bg-amber-500 rounded-full" />
                <h2 className="text-xl font-black text-stone-800 tracking-tight">IP BAN 登録</h2>
              </div>
              <IpBanForm />
            </div>
          </div>

          {/* IP BAN一覧（テーブル形式） */}
          <div className="card">
            {/* ツールバー: 新規BAN発行 */}
            <div className="px-6 py-4 border-b border-stone-100 flex justify-end">
              <a
                href="#ip-ban-form"
                className="btn-danger btn-sm"
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '0.625rem',
                  boxShadow: '0 4px 12px -2px rgba(239, 68, 68, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  textDecoration: 'none',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                新規BAN発行
              </a>
            </div>

            {bans.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ShieldBan className="w-6 h-6" />
                </div>
                <p className="text-stone-500 text-sm">有効なIP BANはまだありません。</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ステータス</th>
                      <th>IPアドレス</th>
                      <th>理由</th>
                      <th>発行者</th>
                      <th className="text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bans.map((ban) => (
                      <tr key={ban.id}>
                        <td>
                          <span className="badge badge-red">
                            <span className="badge-dot" style={{ background: '#ef4444' }} />
                            BAN中
                          </span>
                        </td>
                        <td>
                          <code className="font-mono font-bold text-stone-800 text-sm">{ban.ip}</code>
                        </td>
                        <td className="text-sm text-stone-600 max-w-xs truncate">{ban.reason}</td>
                        <td className="text-sm text-stone-500">
                          {formatDateTimeJst(ban.createdAt).split(' ')[0]}
                        </td>
                        <td className="text-center">
                          <UnIpBanButton banId={ban.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* フッター: ページネーション */}
            <div className="px-6 py-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-stone-500">全 <strong className="text-stone-700">{bans.length}</strong> 件</span>
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

          {/* アクセス記録一覧 */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-7 bg-amber-500 rounded-full" />
                <h2 className="text-xl font-black text-stone-800 tracking-tight">アクセス記録</h2>
              </div>
            </div>
            {records.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" /></svg>
                </div>
                <p className="text-stone-500 text-sm">記録された IP はまだありません。</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ステータス</th>
                      <th>IPアドレス</th>
                      <th>ブラウザ</th>
                      <th>初回アクセス</th>
                      <th>最終アクセス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.deviceId}>
                        <td>
                          {record.isBanned ? (
                            <span className="badge badge-red">
                              <span className="badge-dot" />
                              BAN中
                            </span>
                          ) : (
                            <span className="badge badge-stone">
                              <span className="badge-dot" />
                              未BAN
                            </span>
                          )}
                        </td>
                        <td>
                          <code className="font-mono font-bold text-stone-800 text-sm">{record.ip}</code>
                        </td>
                        <td className="text-xs text-stone-500 max-w-xs truncate" title={record.browser}>
                          {record.browser}
                        </td>
                        <td className="text-sm text-stone-500">{formatDateTimeJst(record.firstSeenAt).split(' ')[0]}</td>
                        <td className="text-sm text-stone-500">{formatDateTimeJst(record.lastSeenAt).split(' ')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-6 py-4 border-t border-stone-100 flex items-center">
              <span className="text-sm text-stone-500">全 <strong className="text-stone-700">{records.length}</strong> 件</span>
            </div>
          </div>
        </>
      )}

      <div className="pt-8">
        <Link href="/owner" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
          ← オーナー画面に戻る
        </Link>
      </div>
    </div>
  );
}
