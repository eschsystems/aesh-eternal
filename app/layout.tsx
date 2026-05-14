import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const adamesch = localFont({
  src: [
    { path: "../public/fonts/adamesch-regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-hand",
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-term",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "æsh-eternal",
  description: "A platform to clone yourself into an artificial consciousness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${adamesch.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
