import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // レビュー画像は1枚10MBまで（最大5枚）のため、余裕を見て55MBに設定
      bodySizeLimit: "55mb",
    },
  },
};

export default nextConfig;
