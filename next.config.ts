import type { NextConfig } from "next";

const ZOOP = process.env.ZOOP_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy Zoop's API calls (relative fetch('api/...') from Zoop's JS resolves here)
      {
        source: "/journal/whatsapp/api/:path*",
        destination: `${ZOOP}/api/:path*`,
      },
      // Proxy Zoop's static assets (style.css, app.js referenced relative in index.html)
      {
        source: "/journal/whatsapp/:file(style\\.css|app\\.js)",
        destination: `${ZOOP}/:file`,
      },
      // Proxy Zoop's root HTML — must come last
      {
        source: "/journal/whatsapp",
        destination: `${ZOOP}/`,
      },
    ];
  },
};

export default nextConfig;
