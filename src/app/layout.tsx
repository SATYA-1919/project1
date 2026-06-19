import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/common/QueryProvider";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Convene — where tech communities gather",
    template: "%s · Convene",
  },
  description:
    "Convene is a curated home for tech festivals, hackathons, conferences and workshops. Find what's worth showing up for.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <QueryProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </QueryProvider>
        <Toaster position="bottom-right" theme="light" closeButton />
        {/* Behavioural analytics tracker (page_view + click). */}
        <Script src="/tracker.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
