import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AppDownloadProvider } from "@/components/AppDownloadProvider";
import { AppDownloadModal } from "@/components/AppDownloadModal";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://anyme.in",
  ),
  title: "AnyMe | Watch Free Anime Microdramas",
  description:
    "Watch free anime microdrama episodes in your browser. Premium episodes continue in the AnyMe app — India's vertical anime platform.",
  keywords: [
    "AnyMe",
    "anime",
    "microdrama",
    "vertical anime",
    "India anime",
    "short anime",
    "watch free",
  ],
  icons: {
    icon: "/anyme-logo.png",
    apple: "/anyme-logo.png",
  },
  openGraph: {
    title: "AnyMe | Anime in Microdrama",
    description:
      "Watch free episodes on the web. Get the app for premium series.",
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
        <AppDownloadProvider>
          <AnalyticsProvider />
          <Header />
          <main>{children}</main>
          <Footer />
          <AppDownloadModal />
        </AppDownloadProvider>
      </body>
    </html>
  );
}
