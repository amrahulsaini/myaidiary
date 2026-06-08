import type { Metadata } from "next";
import { Montserrat, Inconsolata } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { HeaderScroll } from "@/components/HeaderScroll";

const montserrat = Montserrat({ variable: "--font-montserrat", weight: ["700", "900"], subsets: ["latin"], display: "swap" });
const inconsolata = Inconsolata({ variable: "--font-inconsolata", weight: ["400", "500", "600"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://myaidiary.me"),
  title: { default: "MyAIDiary — Your AI-powered journal", template: "%s · MyAIDiary" },
  description:
    "A private, AI-powered journal. Write your day and get summaries, mood insights, gentle prompts, and chat with your own journal.",
  icons: { icon: "/myaidiary-faviconandshortlogo-penonly.png" },
  openGraph: { title: "MyAIDiary", description: "Your AI-powered journal.", url: "https://myaidiary.me", siteName: "MyAIDiary", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inconsolata.variable}`}>
      <body>
        {/* hand-drawn wiggle filter for accent images */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
          <filter id="wiggle">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" result="noise" seed="7" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
          </filter>
        </svg>
        <HeaderScroll />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
