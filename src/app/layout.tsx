import type { Metadata, Viewport } from "next";
import { Sorts_Mill_Goudy, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/site";
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
    default: "Tømrer Kawiche | Tømrer i Bergen og Nordhordland",
    template: "%s · Tømrer Kawiche"
  },
  description:
    "Tømrer Kawiche utfører rehabilitering, terrasse, tilbygg, kledning, vinduer, dører og innvendig tømrerarbeid i Bergen, Nordhordland og omegn.",
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
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  publisher: site.legalName,
  alternates: {
    canonical: "/",
    languages: { "nb-NO": "/" }
  },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: "https://tomrerkawiche.no",
    siteName: "Tømrer Kawiche",
    title: "Tømrer Kawiche | Tømrer i Bergen og Nordhordland",
    description:
      "Tømrer Kawiche utfører rehabilitering, terrasse, tilbygg, kledning, vinduer, dører og innvendig tømrerarbeid i Bergen, Nordhordland og omegn."
  },
  twitter: {
    card: "summary_large_image",
    title: "Tømrer Kawiche | Tømrer i Bergen og Nordhordland",
    description:
      "Tømrer Kawiche utfører rehabilitering, terrasse, tilbygg, kledning, vinduer, dører og innvendig tømrerarbeid i Bergen, Nordhordland og omegn."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  },
  category: "Bygg og anlegg"
};

// Nettleserens verktoeylinje paa mobil faar samme farge som siden (bone).
export const viewport: Viewport = {
  themeColor: "#e7e5df"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb-NO" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-bone text-ink antialiased">
        {/* Hopplenke: foerste Tab-trykk viser den, og den hopper forbi
            menyen rett til innholdet. Usynlig for musebrukere. */}
        <a
          href="#innhold"
          className="eyebrow sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-5 focus:py-3 focus:text-bone"
        >
          Hopp til innhold
        </a>
        <JsonLd />
        <Nav />
        <main id="innhold" className="pb-14 lg:pb-0">{children}</main>
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
