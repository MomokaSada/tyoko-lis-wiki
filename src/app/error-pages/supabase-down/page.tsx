import Link from 'next/link';
import { CloudOff, ArrowLeft } from 'lucide-react';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'データベース接続エラー',
  description: 'データベースに接続できませんでした。',
  robots: { index: false },
};

export default function SupabaseDownPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center mx-auto border border-sky-100">
          <CloudOff className="w-10 h-10 text-sky-500" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter">サーバー接続エラー</h1>
          <p className="text-stone-500 font-bold text-sm uppercase tracking-widest">Connection Error</p>
          <p className="text-stone-600 font-medium leading-relaxed">
            現在認証サーバーに接続できないため、一部の機能がご利用いただけません。しばらくしてから再度お試しください。
          </p>
          <p className="text-xs text-stone-400 font-medium mt-4">
            編集・管理機能はご利用いただけませんが、閲覧は可能です。
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10"
        >
          <ArrowLeft size={18} />
          ホームに戻る
        </Link>
        <div className="pt-8 flex justify-center opacity-20">
          <TyokoreIcon className="w-16 h-16" />
        </div>
      </div>
    </div>
  );
}
