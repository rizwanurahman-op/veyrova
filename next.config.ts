import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudinary CDN — our image host
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/jmllpjni/**",
      },
    ],
  },
};

export default nextConfig;
