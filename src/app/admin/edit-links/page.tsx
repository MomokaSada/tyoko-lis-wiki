import { EditLinkForm } from './edit-link-form';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getEditLinks } from '@/server/services/editLinkService';
import { CopyableLink } from '@/components/ui/CopyableLink';
import { MobileActions } from '@/components/posts/MobileActions';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import Link from 'next/link';

function getStatusBadge(status: 'active' | 'expired' | 'inactive' | 'limit-reached') {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 有効</span>;
    case 'expired':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 期限切れ</span>;
    case 'inactive':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> 無効化済み</span>;
    case 'limit-reached':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> 上限到達</span>;
  }
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
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tighter mb-2">記事編集リンク管理</h1>
          <p className="text-stone-500 font-medium">記事やWikiの編集用の一時的なセッションリンクを発行します。</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">新しい編集リンクを発行</h2>
          <EditLinkForm />
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">発行済み編集リンク一覧</h2>

          {links.length === 0 ? (
            <p className="text-stone-500">まだ発行された編集リンクはありません。</p>
          ) : (
            <div>
              {/* Mobile View: Card List */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {links.map((link) => (
                  <div key={link.uuid} className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      {getStatusBadge(link.status)}
                      <div className="text-right">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Usage</div>
                        <div className="text-sm font-black text-stone-800">{link.editsUsed} / {link.maxEdits} 回</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">UUID / URL</div>
                      <div className="font-mono text-xs text-stone-600 break-all bg-white border border-stone-100 p-2 rounded-lg">{link.uuid}</div>
                      <CopyableLink
                        url={`${process.env.NEXT_PUBLIC_APP_URL}/posts/create?session=${link.uuid}`}
                        className="text-[10px] mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="text-xs">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Start</div>
                        <div className="font-bold text-stone-700">{link.startAt.toISOString().split('T')[0]}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">End</div>
                        <div className="font-bold text-stone-700">{link.endAt.toISOString().split('T')[0]}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                      <div className="text-[10px] text-stone-400 font-medium">
                        作成者: {link.authorName ?? `user:${link.authorId}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-stone-400 border-b border-stone-100 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4">UUID / URL</th>
                      <th className="pb-3 px-4">Usage</th>
                      <th className="pb-3 px-4">Dates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {links.map((link) => (
                      <tr key={link.uuid} className="hover:bg-stone-50 transition-colors group">
                        <td className="py-4 px-4">{getStatusBadge(link.status)}</td>
                        <td className="py-4 px-4">
                          <div className="font-mono text-stone-600 mb-1">{link.uuid}</div>
                          <CopyableLink
                            url={`${process.env.NEXT_PUBLIC_APP_URL}/posts/create?session=${link.uuid}`}
                            className="text-[10px] max-w-xs"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-stone-700">{link.editsUsed} / {link.maxEdits} 回</div>
                          <div className="text-[10px] text-stone-400">作成者: {link.authorName ?? `user:${link.authorId}`}</div>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-stone-500">
                          <div><span className="text-stone-400">開始:</span> {link.startAt.toISOString().split('T')[0]}</div>
                          <div><span className="text-stone-400">終了:</span> {link.endAt.toISOString().split('T')[0]}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="pt-8">
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
