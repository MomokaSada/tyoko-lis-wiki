import type { NextConfig } from "next";

/** 開発環境のマシンホスト名（localhost 以外を使う場合に .env で指定） */
const devHostname = process.env.NEXT_PUBLIC_DEV_HOSTNAME;

/** CSP ノンスを生成する（ビルド時にはダミー、本番はサーバー側で上書き） */
// 非推奨: next.config のヘッダーは静的な文字列しか使えないため、
// CSP は middleware (proxy.ts) で動的に設定する方針に変更。
// 参照: doc/architecture/csp-strategy.md

const nextConfig: NextConfig = {
  // 型チェックは build スクリプト内で tsc --noEmit により実行するため、
  // next.config 側の ignoreBuildErrors は削除する。
  // 参照: package.json scripts.build
  allowedDevOrigins: devHostname ? [devHostname] : [],
  images: {
    remotePatterns: [
      ...(devHostname
        ? [
            {
              // Supabase Storage (ローカル開発環境: カスタムホスト名)
              protocol: "http" as const,
              hostname: devHostname,
              port: "54321",
              pathname: "/storage/v1/**",
            },
          ]
        : []),
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
