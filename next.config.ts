import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Optimize for production
  reactStrictMode: true,
  // Image optimization
  images: {
    domains: [],
    remotePatterns: [],
  },
};

export default nextConfig;
