import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Bypass Vercel Image Optimization so Hobby quotas
    // (transformations / cache writes) are not consumed.
    // Images are already on CloudFront — serve them directly.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2n27ldvfmst6a.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "anyme.publicvm.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
