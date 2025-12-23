import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: siteUrl ? `${siteUrl.replace(/\/$/, "")}/sitemap.xml` : undefined,
  };
}
