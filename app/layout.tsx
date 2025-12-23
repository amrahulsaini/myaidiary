import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: "MyAIDiary",
    template: "%s · MyAIDiary",
  },
  description:
    "MyAIDiary is a privacy-first diary app with AI-powered voice and insights. Record daily notes and reflect on patterns — with more AI features on the roadmap.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "MyAIDiary",
    description:
      "A privacy-first diary app with AI-powered voice and insights — built for daily reflection.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyAIDiary",
    description:
      "A privacy-first diary app with AI-powered voice and insights — built for daily reflection.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50`}
      >
        {children}
      </body>
    </html>
  );
}
