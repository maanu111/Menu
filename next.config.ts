import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*", "./prisma/**/*"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
    ],
  },
  async rewrites() {
    const adminUrl =
      process.env.ADMIN_URL ||
      process.env.NEXT_PUBLIC_ADMIN_URL ||
      "http://localhost:3002";
    return [
      {
        source: "/uploads/:path*",
        destination: `${adminUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
