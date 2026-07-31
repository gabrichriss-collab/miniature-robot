import type { Metadata } from "next";
import { Sorts_Mill_Goudy, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Display (H1) — Sorts Mill Goudy, per brief.
const display = Sorts_Mill_Goudy({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap"
});

// Fallback for paragraph body. Penumbra Std is licensed and layered in via
// @font-face in globals.css when /public/fonts/PenumbraStd-*.woff2 exists —
// Cormorant Garamond keeps the serif tone until then.
const body = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body-fallback",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tomrerkawiche.no"),
  title: {
    default: "TØMRER KAWICHE — Håndverk med presisjon",
    template: "%s · TØMRER KAWICHE"
  },
  description:
    "Tømrer Kawiche bygger boliger, tilbygg og spesialsnekkerier i tre. Fra fundament til finish – håndverk med presisjon.",
  openGraph: {
    title: "TØMRER KAWICHE",
    description:
      "Håndverk med presisjon. Boliger, tilbygg og spesialsnekkerier i tre.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-bone text-ink antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
