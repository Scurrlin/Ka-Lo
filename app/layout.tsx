import type { Metadata } from "next";
import "./globals.css";
import ScrollRestoration from "./components/ScrollRestoration";

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
    <html lang="en">
      <body>
        <ScrollRestoration />
        {children}
      </body>
    </html>
  );
}
