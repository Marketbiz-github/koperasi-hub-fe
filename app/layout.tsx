import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KoperasiHub - Platform Terpadu untuk Vendor, Koperasi & Affiliator",
  description: "KoperasiHub adalah platform e-commerce terpadu yang menghubungkan vendor, koperasi, dan affiliator. Kelola toko, produk, dan penjualan Anda dengan mudah.",
  keywords: [
    "koperasi",
    "e-commerce",
    "platform digital",
    "vendor",
    "marketplace",
    "affiliator",
    "toko online",
    "sistem penjualan",
  ],
  authors: [{ name: "KoperasiHub" }],
  creator: "KoperasiHub",
  publisher: "KoperasiHub",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://koperasi.hub",
    siteName: "KoperasiHub",
    title: "KoperasiHub - Platform Terpadu untuk Vendor, Koperasi & Affiliator",
    description: "Platform e-commerce terpadu yang menghubungkan vendor, koperasi, dan affiliator Indonesia.",
    images: [
      {
        url: "https://koperasi.hub/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KoperasiHub",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KoperasiHub - Platform Terpadu untuk Vendor, Koperasi & Affiliator",
    description: "Platform e-commerce terpadu yang menghubungkan vendor, koperasi, dan affiliator Indonesia.",
    images: ["https://koperasi.hub/og-image.jpg"],
    creator: "@koperasihub",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://koperasi.hub",
  },
};

import { CaptchaProvider } from "@/components/providers/CaptchaProvider";

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
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CaptchaProvider>
          {children}
        </CaptchaProvider>
      </body>
    </html>
  );
}
