import type { NextConfig } from "next";

const wpBaseUrl = process.env.NEXT_PUBLIC_WP_BASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "coptex.local",
      },
      {
        protocol: "https",
        hostname: "coptex.local",
      },
    ],
  },
  async rewrites() {
    if (!wpBaseUrl) {
      return [];
    }

    const wpRoutes = [
      "/product-tag/:path*",
      "/shop/:path*",
      "/cart/:path*",
      "/checkout/:path*",
      "/my-account/:path*",
    ];

    return wpRoutes.map((source) => ({
      source,
      destination: `${wpBaseUrl}${source}`,
    }));
  },
};

export default nextConfig;
