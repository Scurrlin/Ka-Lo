import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import ScrollRestoration from "./components/ScrollRestoration";

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
    <html lang="en" className={instrumentSans.variable}>
      <body>
        <ScrollRestoration />
        {children}
      </body>
    </html>
  );
}
