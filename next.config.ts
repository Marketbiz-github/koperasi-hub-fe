import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    'koperasi-hub-fe.test',
    '*.koperasi-hub-fe.test',
    'appshub.my.id',
    '*.appshub.my.id',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};


export default nextConfig;
