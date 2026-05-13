import Link from 'next/link';
import { ServerCrash, ArrowLeft } from 'lucide-react';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';

export default function ServerErrorPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto border border-red-100">
          <ServerCrash className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter">500</h1>
          <p className="text-stone-500 font-bold text-sm uppercase tracking-widest">Internal Server Error</p>
          <p className="text-stone-600 font-medium leading-relaxed">
            サーバー内部でエラーが発生しました。時間をおいて再度お試しください。
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
