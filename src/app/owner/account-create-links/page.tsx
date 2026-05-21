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
import { KeySquare, Plus } from 'lucide-react';

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

export default async function AccountCreateLinksPage() {
  const actor = await getCurrentActor();
  const links = actor ? await getAccountCreateLinks(actor) : [];

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
              <KeySquare className="w-16 h-16 text-blue-400/30 ml-6 mt-6" />
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

        <div className="bg-white border border-stone-200 rounded-[1.75rem] p-8 shadow-sm">
          <AccountCreateLinkForm />
        </div>

        {/* 発行済みリンク一覧 */}
        <div className="bg-white border border-stone-200 rounded-[1.75rem] overflow-hidden shadow-sm">
          {links.length === 0 ? (
            <div className="p-8">
              <p className="text-stone-500">まだ発行されたリンクはありません。</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {links.map((link) => (
                <div
                  key={link.uuid}
                  className="px-6 py-5 hover:bg-amber-50/30 transition-colors group flex flex-col lg:flex-row lg:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(link.status)}
                      <span className="text-xs text-stone-400">
                        有効期限: {formatDateTimeJst(link.endAt).split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-stone-600 truncate group-hover:text-amber-700 transition-colors">
                      {`${process.env.NEXT_PUBLIC_APP_URL}/auth/register?session=${link.uuid}`}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      作成: {link.authorName ?? `user:${link.authorId}`} | {formatDateTimeJst(link.startAt).split(' ')[0]}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {link.status === 'active' && (
                      <InvalidButton uuid={link.uuid} />
                    )}
                    <button className="text-xs font-bold text-stone-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-stone-200 hover:border-red-200">
                      失効
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 新規発行 */}
          <div className="px-6 py-5 bg-stone-50 border-t border-stone-200 flex justify-end">
            <Link
              href="#new-link-form"
              className="btn-primary inline-flex items-center gap-2 bg-stone-900 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-stone-800 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              新規リンク発行
            </Link>
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
