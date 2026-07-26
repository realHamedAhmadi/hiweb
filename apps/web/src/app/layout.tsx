import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";

// Metadata is minimal placeholder content — SEO strategy (Section 10)
// has not been designed yet.
export const metadata: Metadata = {
  title: "Hiweb",
  description: "Hiweb — foundation stage.",
};

// Locale/RTL handling intentionally omitted here. When Section 11 (i18n)
// is designed, <html lang="..." dir="ltr|rtl"> will need to be set
// dynamically per-locale rather than hardcoded as below.
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        {/*
          Pi SDK — loaded globally so window.Pi is available wherever
          lib/piSdk.ts needs it (currently just the Header's login
          button). `strategy="afterInteractive"` per Next.js's own
          guidance for third-party scripts that aren't needed for the
          initial render.
        */}
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
