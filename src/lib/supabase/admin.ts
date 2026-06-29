/**
 * Supabase 管理クライアント（Service Role Key）。
 *
 * ## セキュリティ注意
 *
 * - `SUPABASE_SERVICE_ROLE_KEY` は全権限キーであり、RLS を完全にバイパスする。
 * - 使用は**Auth 管理操作**（ユーザー作成・パスワードリセット）と
 *   **Storage サーバーサイドアップロード** に限定すること。
 * - **読み取り専用のデータ取得には使用しないこと。**
 *   代わりに `@/lib/supabase/server.ts` (anon key + RLS) を使用する。
 *
 * ## 将来の改善
 *
 * 真に特権が必要な操作を Supabase Edge Functions に分離し、
 * Service Role Key がサーバーコードから完全に隠蔽されるアーキテクチャが理想的。
 * 現状は Next.js Server Actions / Route Handlers 内で使用しているため、
 * Service Role Key は環境変数としてサーバーに存在する。
 *
 * ## 使用箇所一覧
 *
 * - `server/services/authService.ts` — ユーザー管理（作成・削除・パスワード変更）
 * - `server/lib/thumbnailUpload.ts` — サムネイル画像のアップロード
 *
 * @see `@/lib/supabase/server.ts` — 通常の認証済みクライアント（anon key + RLS）
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY',
    );
  }
  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return adminClient;
}
