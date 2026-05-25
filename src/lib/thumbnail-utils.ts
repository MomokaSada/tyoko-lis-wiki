/**
 * 保存されたパス（フルURLまたは相対パス）から、表示用の公開URLを生成します。
 * クライアント側（ブラウザ）とサーバー側（Node.js/Edge Runtime）の両方で使用可能です。
 */
export function getPublicThumbnailUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // http/https スキームのフルURL の場合、許可されたドメインのホワイトリスト検証
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path);
      // Supabase のドメインのみ許可
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || '';
      if (supabaseUrl && url.origin === new URL(supabaseUrl).origin) {
        return path;
      }
      // ホワイトリストに含まれていない場合は null を返す（SSRF/Open Redirect 防止）
      return null;
    } catch {
      // 不正な URL は null を返す
      return null;
    }
  }

  // / から始まる相対パスの場合は、Supabaseのドメインを付与する
  if (path.startsWith('/')) {
    // NEXT_PUBLIC_SUPABASE_URL はクライアント側に露出される環境変数です
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    if (!supabaseUrl) return path;
    // new URL() で結合することでパス内の特殊文字（日本語ファイル名やスペース等）が
    // 自動的にURLエンコードされ、かつ既にエンコード済みの文字は二重エンコードされない
    try {
      return new URL(path, supabaseUrl).href;
    } catch {
      // フォールバック: 単純結合
      return `${supabaseUrl}${path}`;
    }
  }

  return null;
}
