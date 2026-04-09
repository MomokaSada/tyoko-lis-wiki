/**
 * 保存されたパス（フルURLまたは相対パス）から、表示用の公開URLを生成します。
 * クライアント側（ブラウザ）とサーバー側（Node.js/Edge Runtime）の両方で使用可能です。
 */
export function getPublicThumbnailUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // すでにフルURL（http...）の場合はそのまま返す
  if (path.startsWith('http')) {
    return path;
  }

  // / から始まる相対パスの場合は、Supabaseのドメインを付与する
  if (path.startsWith('/')) {
    // NEXT_PUBLIC_SUPABASE_URL はクライアント側に露出される環境変数です
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    if (!supabaseUrl) return path;
    return `${supabaseUrl}${path}`;
  }

  return path;
}
