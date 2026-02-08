import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    'koperasi-hub-fe.test',
    '*.koperasi-hub-fe.test',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'koperasi-hub-fe.test',
      },
      {
        protocol: 'https',
        hostname: 'koperasihub.koyeb.app',
      },
    ],
  },
};


export default nextConfig;
