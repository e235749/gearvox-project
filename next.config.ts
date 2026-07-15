import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // アバター・レビュー画像は1枚5MBまで（最大5枚）のため、余裕を見て26MBに設定
      bodySizeLimit: "26mb",
    },
  },
};

export default nextConfig;
