import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
