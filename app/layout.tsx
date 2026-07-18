import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "KALO",
  description: "Ka-Lo official site concept"
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
