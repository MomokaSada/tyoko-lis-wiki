'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      // Supabase Auth はメール/電話番号ベースのため、裏側でダミーのドメインを付与してやり取りする
      const dummyEmail = `${username}@test.com`;
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // ログイン成功 → ホームにリダイレクト
      router.push('/');
      router.refresh();
    } catch {
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      {/* エラー表示 */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ユーザー名 */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ユーザー名
        </label>
        <input
          id="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                     shadow-sm transition-colors
                     focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* パスワード */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password123"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                     shadow-sm transition-colors
                     focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                     dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
                   shadow-sm transition-all
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                   disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>

      {/* テスト用ヒント */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
        <p className="mb-1 font-semibold">テスト用アカウント:</p>
        <ul className="space-y-0.5">
          <li><code>admin</code> / <code>password123</code> (Admin)</li>
          <li><code>owner</code> / <code>password123</code> (Owner)</li>
          <li><code>user</code>  / <code>password123</code> (一般)</li>
        </ul>
      </div>
    </form>
  );
}
