import type { NextConfig } from "next";

const ZOOP = process.env.ZOOP_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/journal/whatsapp/api/:path*", destination: `${ZOOP}/api/:path*` },
      { source: "/journal/whatsapp/style.css",  destination: `${ZOOP}/style.css` },
      { source: "/journal/whatsapp/app.js",     destination: `${ZOOP}/app.js` },
      { source: "/journal/whatsapp",            destination: `${ZOOP}/` },
    ];
  },
};

export default nextConfig;
