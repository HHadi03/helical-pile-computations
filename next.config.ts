import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['dl1kvzlj-3000.uks1.devtunnels.ms', 'localhost:3000'],
    },
  },
};

export default nextConfig;
