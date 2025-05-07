import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  


  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/upload/**',
      },
    ],
  },
};

export default nextConfig;
