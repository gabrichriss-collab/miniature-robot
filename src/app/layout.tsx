import type { Metadata } from "next";
import { Sorts_Mill_Goudy, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import MobileActionBar from "@/components/MobileActionBar";

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
    default: "Tømrer Kawiche — Håndverk i tre for kommende generasjoner",
    template: "%s · Tømrer Kawiche"
  },
  description:
    "Tømrer Kawiche er et tømrerfirma i Bergen, Nordhordland og omegn. Vi tar rehabilitering, tilbygg, terrasser, fasade, vinduer og innvendige arbeider — planlagt, utført og ferdigstilt av samme håndverker.",
  keywords: [
    "tømrer Bergen",
    "snekker Bergen",
    "terrasse Bergen",
    "bygge terrasse Bergen",
    "rehabilitering Bergen",
    "tilbygg Bergen",
    "skifte kledning Bergen",
    "kledning Bergen",
    "bytte vinduer Bergen",
    "tømrer Nordhordland",
    "tømrer Alver",
    "tømrer Åsane"
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
    title: "Tømrer Kawiche — Håndverk i tre for kommende generasjoner",
    description:
      "Boliger, tilbygg, innredning og spesialsnekring i tre — for Nordhordland, Bergen og resten av Vestland."
  },
  twitter: {
    card: "summary_large_image",
    title: "Tømrer Kawiche — Håndverk i tre for kommende generasjoner",
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
        <main className="pb-14 lg:pb-0">{children}</main>
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
