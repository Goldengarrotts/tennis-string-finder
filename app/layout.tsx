import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'StringLab — Tennis String Finder & Comparison',
    template: '%s | StringLab',
  },
  description:
    'Find the perfect tennis string for your racquet and playing style. Plain-English advice, head-to-head comparisons, and guided recommendations for every level.',
  keywords: ['tennis strings', 'string comparison', 'tennis string finder', 'polyester strings', 'tennis racquet strings'],
  openGraph: {
    type: 'website',
    siteName: 'StringLab',
    title: 'StringLab — Tennis String Finder & Comparison',
    description: 'Find the perfect tennis string for your game. Compare, filter, and get personalised picks.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}