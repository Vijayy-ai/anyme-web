import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AnyMe | India's Vertical Anime Microdrama Platform",
  description:
    "Watch original anime microdramas in 1–2 minute episodes. India's first vertical anime platform with regional language support. Download AnyMe now.",
  keywords: [
    "AnyMe",
    "anime",
    "microdrama",
    "vertical anime",
    "India anime",
    "short anime",
  ],
  icons: {
    icon: "/anyme-logo.png",
    apple: "/anyme-logo.png",
  },
  openGraph: {
    title: "AnyMe | Anime in Microdrama",
    description:
      "India's first vertical anime microdrama platform. Binge original stories, one short episode at a time.",
    type: "website",
    images: ["/anyme-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body suppressHydrationWarning>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
