'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw, Database, WifiOff } from 'lucide-react';

function isDbError(error: Error): boolean {
  const msg = error.message;
  return (
    msg.includes('fetch failed') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('Failed query:') ||
    msg.includes('database') ||
    msg.includes('DATABASE_URL') ||
    msg.includes('postgres') ||
    msg.includes('connection')
  );
}

export default function RootErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  const dbError = isDbError(error);
  const digest = error.digest;

  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-10">
      <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="relative animate-float-in max-w-lg mx-auto">
        <div className="bg-white border border-red-200 rounded-[2rem] p-10 overflow-hidden shadow-sm text-center">
          {/* アイコン */}
          <div className={`mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center border-4 ${
            dbError
              ? 'bg-red-50 border-red-100'
              : 'bg-amber-50 border-amber-100'
          }`}>
            {dbError
              ? <WifiOff className="w-10 h-10 text-red-500" />
              : <AlertTriangle className="w-10 h-10 text-amber-500" />
            }
          </div>

          <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-3">
            {dbError ? 'データベース接続エラー' : 'エラーが発生しました'}
          </h1>

          <p className="text-stone-500 text-base leading-relaxed mb-8">
            {dbError ? (
              <>
                データベースとの通信が確立できませんでした。
                <br />
                しばらく時間をおいて再度お試しください。
              </>
            ) : (
              <>
                予期しないエラーが発生しました。
                <br />
                申し訳ありませんが、もう一度お試しください。
              </>
            )}
          </p>

          {/* エラー詳細（開発時のみ） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-red-700 mb-1">
                    エラー詳細 {digest && <span className="text-red-400 font-mono">({digest})</span>}
                  </p>
                  <p className="text-sm text-red-600 font-mono leading-relaxed break-all whitespace-pre-wrap">
                    {error.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* アクション */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-stone-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-stone-800 transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              トップページに戻る
            </Link>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-white text-stone-700 font-bold px-6 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              再試行
            </button>
          </div>
        </div>

        {dbError && (
          <p className="text-center text-stone-400 text-xs mt-6">
            問題が解決しない場合は、システム管理者にお問い合わせください。
          </p>
        )}
      </div>
    </section>
  );
}
