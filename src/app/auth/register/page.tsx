import { requireAccountCreateSession } from '@/lib/auth/guards';
import { RegisterForm } from './register-form';

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
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            招待リンクからアカウントを作成
          </h1>
          <p className="text-sm text-gray-600">
            有効な招待リンクであることを確認したうえで、ログイン用アカウントを作成します。
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p><strong>Guard 検証:</strong> {valid ? 'OK' : 'NG'}</p>
          <p><strong>有効な招待トークン:</strong> {token}</p>
        </div>

        {token && <RegisterForm sessionToken={token} />}

        <a href="/" className="text-sm text-blue-600 hover:underline">
          ホームに戻る
        </a>
      </div>
    </main>
  );
}
