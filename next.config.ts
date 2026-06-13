import type { NextConfig } from "next";

// NOTE: Next.js bakes rewrite destinations at BUILD time, so this must resolve
// during `next build`. The fallback is the live Zoop app URL on the same VM.
const ZOOP = process.env.ZOOP_URL ?? "http://ly71zwxs1558g0k29r3vlci1.34.131.117.133.sslip.io";

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
