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
    default: "Tømrer Kawiche — Tømrermester i Nordhordland",
    template: "%s · Tømrer Kawiche"
  },
  description:
    "Tømrer Kawiche er et tømrerverksted i Myking i Nordhordland. Vi bygger boliger, tilbygg, innredning og spesialsnekring i tre — for kunder i Alver, Osterøy, Bergen og resten av Vestland.",
  keywords: [
    "tømrer Nordhordland",
    "tømrer Alver",
    "tømrer Bergen",
    "tømrermester Vestland",
    "snekker Nordhordland",
    "snekker Bergen",
    "tilbygg Vestland",
    "nybygg Nordhordland",
    "påbygg",
    "spesialsnekring",
    "rehabilitering",
    "massivtre",
    "byggmester Bergen",
    "trehus",
    "loftsutbygging",
    "Myking",
    "Alver",
    "Osterøy"
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
    title: "Tømrer Kawiche — Tømrermester i Nordhordland",
    description:
      "Boliger, tilbygg, innredning og spesialsnekring i tre — for Nordhordland, Bergen og resten av Vestland."
  },
  twitter: {
    card: "summary_large_image",
    title: "Tømrer Kawiche — Tømrermester i Nordhordland",
    description:
      "Boliger, tilbygg, innredning og spesialsnekring i tre — for Nordhordland, Bergen og resten av Vestland."
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
