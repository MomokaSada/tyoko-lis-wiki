import type { NextConfig } from "next";

// NOTE: 以前は NEXT_PUBLIC_DEV_HOSTNAME でカスタムホスト名（.local 等）を
// 指定していたが、HMR WebSocket が wss:// で接続しようとして失敗し、
// ページの定期リロードを引き起こす原因となっていた。
// → localhost のみ使用。モバイル確認が必要な場合は LAN IP で直接アクセスする。
//   例: http://192.168.x.x:3000

const nextConfig: NextConfig = {
  // 全関数・ページを Vercel Tokyo (hnd1) リージョンのみにデプロイ
  // Supabase が ap-northeast-1 (東京) にあるため。
  // 以前は ["hnd1", "iad1"] (東京＋US東部) だったが、
  // iad1 からのリクエストが Supabase まで往復 ~200ms かかり、
  // かつ接続プールを圧迫していた。
  experimental: {
    serverActions: {
      allowedOrigins: [
        // 本番環境
        'https://tyoko-lis-wiki.vercel.app',
        process.env.NEXT_PUBLIC_APP_URL,
      ].filter(Boolean) as string[],
    },
  },

  images: {
    // 開発環境では next/image の最適化を無効化する。
    // ローカル Supabase がホスト名解決でプライベートIPを返すため、
    // Vercel Image Optimization がアクセスをブロックするのを避ける。
    // 本番環境では通常通り最適化が有効になる。
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        // Supabase Storage (ローカル開発環境: localhost)
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/**",
      },
      {
        // Supabase Storage (ローカル開発環境: 127.0.0.1)
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/**",
      },
      {
        // Supabase Storage (ローカル開発環境: .local ドメイン)
        protocol: "http",
        hostname: "*.local",
        port: "54321",
        pathname: "/storage/v1/**",
      },
      {
        // Supabase Storage (本番環境)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/**",
      },
    ],
  },
}

export default nextConfig;
