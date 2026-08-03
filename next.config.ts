import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:3001/api/v1";
    return [{ source: "/api/:path*", destination: `${backendApiUrl}/:path*` }];
  },
};

export default nextConfig;
