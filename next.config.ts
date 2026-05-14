import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit /race-day/index.html (not /race-day.html), which works on every
  // static host without server-side route rewrites.
  trailingSlash: true,
};

export default nextConfig;
