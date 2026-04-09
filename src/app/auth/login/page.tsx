import LoginForm from './login-form';
import { TyokoreIcon } from '@/components/icons/TyokoreIcon';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const registered = sp.registered === '1';

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 text-stone-900">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
        {/* Visual Side */}
        <div className="w-full md:w-5/12 bg-amber-600 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group mb-12">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <TyokoreIcon className="w-7 h-7" />
              </div>
            </Link>
            <h2 className="text-4xl font-black mb-4 leading-tight">コミュニティに<br />参加しよう</h2>
            <p className="text-amber-100 font-medium">Wikiの編集機能や専用ダッシュボードはログインユーザーのみ利用できます。</p>
          </div>

          {/* decorative circles */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-500 rounded-full opacity-50 blur-3xl"></div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-black text-stone-800 mb-2">お帰りなさい</h3>
              <p className="text-stone-500 font-medium text-sm">アカウント情報を入力してログインしてください。</p>
            </div>

            {registered && (
              <div className="mb-6 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700 font-bold">
                ✓ アカウントを作成しました。ログインして続けてください。
              </div>
            )}

            <LoginForm />

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
