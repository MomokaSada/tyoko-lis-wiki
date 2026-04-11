import { EditLinkForm } from './edit-link-form';
import { getCurrentActor } from '@/server/lib/currentActor';
import { getEditLinks } from '@/server/services/editLinkService';
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

  return (
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
          <div className="overflow-x-auto">
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
                      <div className="text-[10px] text-stone-400 truncate max-w-xs">{`${process.env.NEXT_PUBLIC_APP_URL}/posts/create?session=${link.uuid}`}</div>
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
        )}
      </div>

      <div className="pt-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors">
          ← 管理画面に戻る
        </Link>
      </div>
    </div>
  );
}
