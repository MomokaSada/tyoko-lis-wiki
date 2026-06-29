import { type Metadata } from 'next';
import Link from 'next/link';
import { WifiOff, Home, AlertTriangle } from 'lucide-react';
import { RetryButton } from './retry-button';

export const metadata: Metadata = {
  title: 'DB接続エラー - Owner',
  robots: { index: false },
};

export default async function DbErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = (() => {
    if (!error) return 'データベースとの接続に失敗しました。';
    try { return decodeURIComponent(error); } catch { return error; }
  })();

  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-10">
      {/* 背景ドット */}
      <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="relative animate-float-in max-w-lg mx-auto">
        <div className="bg-white border border-red-200 rounded-[2rem] p-10 overflow-hidden shadow-sm text-center">
          {/* アイコン */}
          <div className="mx-auto mb-6 w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
            <WifiOff className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-3">
            DB 接続エラー
          </h1>

          <p className="text-stone-500 text-base leading-relaxed mb-8">
            データベースとの通信が確立できませんでした。
            <br />
            しばらく時間をおいて再度お試しください。
          </p>

          {/* エラー詳細 */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700 mb-1">エラー詳細</p>
                <p className="text-sm text-red-600 font-mono leading-relaxed break-all">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>

          {/* アクション */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/owner"
              className="inline-flex items-center gap-2 bg-stone-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-stone-800 transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              ダッシュボードに戻る
            </Link>
            <RetryButton />
          </div>
        </div>

        {/* フッター */}
        <p className="text-center text-stone-400 text-xs mt-6">
          問題が解決しない場合は、システム管理者にお問い合わせください。
        </p>
      </div>
    </section>
  );
}
