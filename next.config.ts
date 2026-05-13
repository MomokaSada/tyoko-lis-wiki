import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 開発速度向上のため、ビルド時の型チェックエラーを無視する
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage (ローカル開発環境: ワークステーション名)
        protocol: "http",
        hostname: "dev-machine.local",
        port: "54321",
        pathname: "/storage/v1/**",
      },
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
