import type { Metadata } from "next";
import { Sorts_Mill_Goudy, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

const display = Sorts_Mill_Goudy({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap"
});

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
    default: "Tømrer Kawiche — Tømrermester i Oslo · Håndverk med presisjon",
    template: "%s · Tømrer Kawiche"
  },
  description:
    "Tømrer Kawiche er et tømrerverksted i Oslo. Vi bygger boliger, tilbygg, interiør og spesialsnekring i tre — med tradisjonelt håndverk og moderne presisjon.",
  keywords: [
    "tømrer Oslo",
    "tømrermester",
    "snekker Oslo",
    "tilbygg",
    "nybygg",
    "påbygg",
    "spesialsnekring",
    "rehabilitering",
    "massivtre",
    "byggmester",
    "trehus",
    "loftsutbygging"
  ],
  authors: [{ name: "Tømrer Kawiche AS" }],
  creator: "Tømrer Kawiche AS",
  publisher: "Tømrer Kawiche AS",
  alternates: {
    canonical: "/",
    languages: { "nb-NO": "/" }
  },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: "https://tomrerkawiche.no",
    siteName: "Tømrer Kawiche",
    title: "Tømrer Kawiche — Tømrermester i Oslo",
    description:
      "Boliger, tilbygg, interiør og spesialsnekring i tre. Håndverk med presisjon."
  },
  twitter: {
    card: "summary_large_image",
    title: "Tømrer Kawiche — Tømrermester i Oslo",
    description:
      "Boliger, tilbygg, interiør og spesialsnekring i tre. Håndverk med presisjon."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
  category: "Bygg og anlegg"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb-NO" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-bone text-ink antialiased">
        <JsonLd />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
