import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    const adminUrl =
      process.env.ADMIN_URL ||
      process.env.NEXT_PUBLIC_ADMIN_URL ||
      "https://quantive-labs.com";
    return [
      {
        source: "/uploads/:path*",
        destination: `${adminUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
