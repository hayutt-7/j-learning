import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
  // @ts-ignore
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
