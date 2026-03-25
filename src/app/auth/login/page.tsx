import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            ログイン
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Chokore Wiki にログインしてください
          </p>
        </div>

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
