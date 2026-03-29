import LoginForm from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams;
  const registered = sp.registered === '1';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            ログイン
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            「ちょこちょこ大百科」にログインしてください
          </p>
        </div>

        {registered && (
          <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
            アカウントを作成しました。ログインして続けてください。
          </div>
        )}

        <LoginForm />

        <div className="text-center">
          <a href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            ← ホームに戻る
          </a>
        </div>
      </div>
    </main>
  );
}
