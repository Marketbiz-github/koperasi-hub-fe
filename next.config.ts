import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow this dev origin to request /_next resources cross-origin during development
  // Replace or add other local dev hostnames if you run multiple dev sites.
  allowedDevOrigins: ['http://koperasi-hub-fe.test'],
};

export default nextConfig;
