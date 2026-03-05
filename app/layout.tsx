import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // IMPORTANT: set this to your real domain (also fixes sitemap/canonicals)
  metadataBase: new URL("https://tennisstringfinder.com"),

  title: {
    default: "TennisStringFinder — Tennis String Finder & Comparison",
    template: "%s | TennisStringFinder",
  },
  description:
    "Find the perfect tennis string for your racquet and playing style. Plain-English advice, head-to-head comparisons, and guided recommendations for every level.",
  keywords: [
    "tennis strings",
    "string comparison",
    "tennis string finder",
    "polyester strings",
    "tennis racquet strings",
  ],
  openGraph: {
    type: "website",
    siteName: "TennisStringFinder",
    title: "TennisStringFinder — Tennis String Finder & Comparison",
    description: "Find the perfect tennis string for your game. Compare, filter, and get personalised picks.",
    url: "https://tennisstringfinder.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}