import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ScrollRestoration from "./components/ScrollRestoration";
import MemeGate from "./components/MemeGate";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap"
});

const siteName = "Ka-Lo Hané";
const siteTitle = "Ka-Lo Hané | Official Website";
const siteDescription = "Not your traditional rapper";
const configuredSiteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL
)?.trim();
const metadataBase = configuredSiteUrl
  ? new URL(
      configuredSiteUrl.startsWith("http")
        ? configuredSiteUrl
        : `https://${configuredSiteUrl}`
    )
  : undefined;
const socialImage = {
  url: metadataBase
    ? new URL("/assets/Silver-Cracks.webp", metadataBase).toString()
    : "https://raw.githubusercontent.com/Scurrlin/Ka-Lo/main/public/assets/Silver-Cracks.webp",
  width: 1024,
  height: 1024,
  alt: "Silver Cracks album cover by Ka-Lo Hané"
};

export const metadata: Metadata = {
  ...(metadataBase
    ? {
        metadataBase,
        alternates: { canonical: "/" }
      }
    : {}),
  title: siteTitle,
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "music",
  keywords: [
    "Ka-Lo Hané",
    "Ka-Lo",
    "KALO",
    "Silver Cracks",
    "hip-hop",
    "rapper",
    "lyricist",
    "producer"
  ],
  referrer: "origin-when-cross-origin",
  formatDetection: {
    address: false,
    email: false,
    telephone: false
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    ...(metadataBase ? { url: "/" } : {}),
    type: "website",
    locale: "en_US",
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [socialImage]
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage]
  }
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#000000"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={instrumentSans.variable} suppressHydrationWarning>
      <body>
        <Script id="intro-scroll-lock" strategy="beforeInteractive">
          {`document.documentElement.classList.add("intro-scroll-locked");`}
        </Script>
        <div id="site-content">
          <ScrollRestoration />
          {children}
        </div>
        <MemeGate />
      </body>
    </html>
  );
}
