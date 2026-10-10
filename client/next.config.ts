import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage (covers any project's Supabase bucket)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Allow any https image source (Unsplash, GitHub avatars, etc.)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
