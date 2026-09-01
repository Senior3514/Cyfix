import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Cyfix flags server/framework banners as information disclosure on the
  // sites it scans; shipping X-Powered-By ourselves would fail our own check.
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
