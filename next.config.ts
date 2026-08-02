import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Placeholder dish photography — replace with the restaurant's own host. */
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
