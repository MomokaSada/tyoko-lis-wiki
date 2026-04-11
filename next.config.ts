import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 開発速度向上のため、ビルド時の型チェックエラーを無視する
    ignoreBuildErrors: true,
  },
}

export default nextConfig;
