import { AccountCreateLinkForm } from './account-create-link-form';
import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getAccountCreateLinks } from '@/server/services/accountCreateLinkService';
import { CopyableLink } from '@/components/ui/CopyableLink';
import { MobileActions } from '@/components/posts/MobileActions';
import { InvalidButton } from './invalid-button';
import { headers } from 'next/headers';
import { HEADER_USER_ROLE } from '@/lib/auth/constants';
import { getCurrentEditor } from '@/server/lib/currentEditor';
import Link from 'next/link';
import { KeySquare } from 'lucide-react';

function getStatusBadge(status: 'active' | 'expired' | 'inactive') {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 有効</span>;
    case 'expired':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 期限切れ</span>;
    case 'inactive':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> 無効化済み</span>;
  }
}

export default async function AccountCreateLinksPage() {
  const actor = await getCurrentActor();
  const links = actor ? await getAccountCreateLinks(actor) : [];

  const headersList = await headers();
  const userRole = headersList.get(HEADER_USER_ROLE);
  const editor = await getCurrentEditor();
  const hasEditSession = !!(editor && editor.type === 'session');

  return (
    <>
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500 text-stone-900">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
          <KeySquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tighter mb-1">アカウント作成リンク管理</h1>
          <p className="text-stone-500 font-medium text-sm">新規ユーザーの登録セッションリンクを発行・管理します。</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
        <AccountCreateLinkForm />
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">発行済みリンク一覧</h2>

        {links.length === 0 ? (
          <p className="text-stone-500">まだ発行されたリンクはありません。</p>
        ) : (
          <div>
            {/* Mobile View: Card List */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {links.map((link) => (
                <div key={link.uuid} className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    {getStatusBadge(link.status)}
                    <div className="text-xs font-bold text-stone-700">
                      {link.authorName ?? `user:${link.authorId}`}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">UUID / URL</div>
                    <div className="font-mono text-xs text-stone-600 break-all bg-white border border-stone-100 p-2 rounded-lg mb-2">{link.uuid}</div>
                    <CopyableLink
                      url={`${process.env.NEXT_PUBLIC_APP_URL}/auth/register?session=${link.uuid}`}
                      className="text-[10px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-xs">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Start</div>
                      <div className="font-bold text-stone-700">{formatDateTimeJst(link.startAt).split(' ')[0]}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">End</div>
                      <div className="font-bold text-stone-700">{formatDateTimeJst(link.endAt).split(' ')[0]}</div>
                    </div>
                  </div>

                  {link.status === 'active' && (
                    <div className="pt-3 border-t border-stone-100">
                      <InvalidButton uuid={link.uuid} />
                    </div>
                  )}
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
                    <th className="pb-3 px-4">Author</th>
                    <th className="pb-3 px-4">Dates</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {links.map((link) => (
                    <tr key={link.uuid} className="hover:bg-stone-50 transition-colors group">
                      <td className="py-4 px-4">{getStatusBadge(link.status)}</td>
                      <td className="py-4 px-4">
                        <div className="font-mono text-stone-600 mb-1">{link.uuid}</div>
                        <CopyableLink
                          url={`${process.env.NEXT_PUBLIC_APP_URL}/auth/register?session=${link.uuid}`}
                          className="text-[10px] max-w-[200px]"
                        />
                      </td>
                      <td className="py-4 px-4 text-stone-700 font-medium">
                        {link.authorName ?? `user:${link.authorId}`}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-stone-500">
                        <div><span className="text-stone-400">開始:</span> {formatDateTimeJst(link.startAt).split(' ')[0]}</div>
                        <div><span className="text-stone-400">終了:</span> {formatDateTimeJst(link.endAt).split(' ')[0]}</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {link.status === 'active' && (
                          <InvalidButton uuid={link.uuid} />
                        )}
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
