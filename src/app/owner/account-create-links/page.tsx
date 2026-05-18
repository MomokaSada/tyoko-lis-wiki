import { AccountCreateLinkForm } from './account-create-link-form';
import { getCurrentActor } from '@/server/lib/currentActor';
import { formatDateTimeJst } from '@/lib/format/formatDateTime';
import { getAccountCreateLinks } from '@/server/services/accountCreateLinkService';
import { CopyableLink } from '@/components/ui/CopyableLink';
import { InvalidButton } from './invalid-button';
import { KeySquare, FileText } from 'lucide-react';
import { OwnerLayout } from '@/components/layout/admin/OwnerLayout';

function getStatusBadge(status: 'active' | 'expired' | 'inactive') {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active</span>;
    case 'expired':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Expired</span>;
    case 'inactive':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-wider"><div className="w-1.5 h-1.5 rounded-full bg-stone-400"></div> Inactive</span>;
  }
}

export default async function AccountCreateLinksPage() {
  const actor = await getCurrentActor();
  const links = actor ? await getAccountCreateLinks(actor) : [];

  return (
    <OwnerLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest">
              <KeySquare size={14} />
              <span>Account Management</span>
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">アカウント作成リンク</h1>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase">Total Links</p>
              <p className="text-2xl font-black text-stone-900">{links.length}件</p>
            </div>
          </div>
          {/* Add other summaries if available */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Action Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-stone-800 mb-4">新規リンク発行</h2>
              <AccountCreateLinkForm />
            </div>
          </div>

          {/* Data Table Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-stone-100">
                <h2 className="text-lg font-black text-stone-800">発行済みリンク一覧</h2>
              </div>
              {links.length === 0 ? (
                <div className="p-12 text-center text-stone-500 font-medium">
                  まだ発行されたリンクはありません。
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-400 border-b border-stone-100 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">UUID & URL</th>
                        <th className="py-4 px-6">Author</th>
                        <th className="py-4 px-6">Period</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {links.map((link) => (
                        <tr key={link.uuid} className="hover:bg-stone-50/50 transition-colors group">
                          <td className="py-4 px-6">{getStatusBadge(link.status)}</td>
                          <td className="py-4 px-6">
                            <div className="font-mono text-stone-600 text-xs mb-2">{link.uuid}</div>
                            <CopyableLink
                              url={`${process.env.NEXT_PUBLIC_APP_URL}/auth/register?session=${link.uuid}`}
                              className="text-[10px] text-blue-500 font-medium hover:underline"
                            />
                          </td>
                          <td className="py-4 px-6 text-stone-700 font-bold">
                            {link.authorName ?? `user:${link.authorId}`}
                          </td>
                          <td className="py-4 px-6 text-xs font-medium text-stone-500">
                            <div className="flex flex-col gap-1">
                              <span><span className="text-stone-400">S:</span> {formatDateTimeJst(link.startAt).split(' ')[0]}</span>
                              <span><span className="text-stone-400">E:</span> {formatDateTimeJst(link.endAt).split(' ')[0]}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {link.status === 'active' && (
                              <InvalidButton uuid={link.uuid} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
