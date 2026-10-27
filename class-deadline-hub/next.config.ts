import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Đảm bảo data/ (file JSON) và font cho ảnh OG được đóng gói khi deploy (Vercel).
  outputFileTracingIncludes: {
    "/**": ["./data/**/*", "./assets/fonts/*.ttf"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
};

export default nextConfig;
