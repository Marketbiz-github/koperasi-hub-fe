import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    'koperasi-hub-fe.test',
    '*.koperasi-hub-fe.test',
  ],
};


export default nextConfig;
