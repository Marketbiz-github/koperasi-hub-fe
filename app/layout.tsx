import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "kopa.network - Platform Terpadu untuk Vendor, Koperasi & Promotor",
  description: "kopa.network adalah platform e-commerce terpadu yang menghubungkan vendor, koperasi, dan promotor. Kelola toko, produk, dan penjualan Anda dengan mudah.",
  keywords: [
    "koperasi",
    "e-commerce",
    "platform digital",
    "vendor",
    "marketplace",
    "promotor",
    "toko online",
    "sistem penjualan",
  ],
  authors: [{ name: "kopa.network" }],
  creator: "kopa.network",
  publisher: "kopa.network",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://kopa.network",
    siteName: "kopa.network",
    title: "kopa.network - Platform Terpadu untuk Vendor, Koperasi & Promotor",
    description: "Platform e-commerce terpadu yang menghubungkan vendor, koperasi, dan promotor Indonesia.",
    images: [
      {
        url: "https://kopa.network/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "kopa.network",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "kopa.network - Platform Terpadu untuk Vendor, Koperasi & Promotor",
    description: "Platform e-commerce terpadu yang menghubungkan vendor, koperasi, dan promotor Indonesia.",
    images: ["https://kopa.network/og-image.jpg"],
    creator: "@kopa.network",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://kopa.network",
  },
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

import { CaptchaProvider } from "@/components/providers/CaptchaProvider";
import { Toaster } from "@/components/ui/sonner";
import AffiliateTracker from "@/components/AffiliateTracker";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CaptchaProvider>
          <AffiliateTracker />
          {children}
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </CaptchaProvider>
      </body>
    </html>
  );
}
