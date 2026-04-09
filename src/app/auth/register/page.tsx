import { requireAccountCreateSession } from '@/lib/auth/guards';
import { RegisterForm } from './register-form';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function AccountRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const sessionToken = typeof sp.session === 'string' ? sp.session : null;

  // Guard 実行: NG ならリダイレクトされる (Admin/Ownerなら/ホームに飛ぶ)
  const { valid, token } = await requireAccountCreateSession(sessionToken);

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 text-stone-900">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
        {/* Visual Side */}
        <div className="w-full md:w-5/12 bg-stone-900 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group mb-12">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                <TyokoreIcon className="w-7 h-7" />
              </div>
            </Link>
            <h2 className="text-4xl font-black mb-4 leading-tight">ようこそ<br />Tyokore Wikiへ</h2>
            <p className="text-stone-300 font-medium">招待セッションが確認されました。<br />アカウントのセットアップを完了して、コミュニティに参加しましょう。</p>
          </div>

          {/* decorative circles */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-stone-800 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-stone-800 rounded-full opacity-50 blur-3xl"></div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              {valid && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200 mb-4">
                  <CheckCircle2 className="w-4 h-4" />
                  有効な招待リンク
                </div>
              )}
              <h3 className="text-2xl md:text-3xl font-black text-stone-800 mb-2">アカウント登録</h3>
              <p className="text-stone-500 font-medium text-sm">必要な情報を入力してアカウントを作成してください。</p>
            </div>

            {token && <RegisterForm sessionToken={token} />}

            <div className="mt-8 text-center md:text-left">
              <Link href="/" className="text-sm font-bold text-stone-400 hover:text-stone-600 transition-colors">
                ← ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
