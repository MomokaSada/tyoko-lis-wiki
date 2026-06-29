import type { NextConfig } from "next";

// NOTE: 以前は NEXT_PUBLIC_DEV_HOSTNAME でカスタムホスト名（.local 等）を
// 指定していたが、HMR WebSocket が wss:// で接続しようとして失敗し、
// ページの定期リロードを引き起こす原因となっていた。
// → localhost のみ使用。モバイル確認が必要な場合は LAN IP で直接アクセスする。
//   例: http://192.168.x.x:3000

const nextConfig: NextConfig = {
  images: {
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
        // Supabase Storage (本番環境)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/**",
      },
    ],
  },
}

export default nextConfig;
