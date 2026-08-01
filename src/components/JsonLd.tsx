import { site } from "@/lib/site";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "GeneralContractor", "HomeAndConstructionBusiness"],
    name: site.legalName,
    alternateName: "Tømrer Kawiche",
    url: site.url,
    email: site.email,
    telephone: site.phone,
    image: `${site.url}/og.jpg`,
    logo: `${site.url}/logo.svg`,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postal,
      addressLocality: site.address.city,
      addressCountry: site.address.country
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Oslo" },
      { "@type": "AdministrativeArea", name: "Viken" },
      { "@type": "Country", name: "Norge" }
    ],
    inLanguage: "nb-NO",
    knowsLanguage: ["nb-NO", "nn-NO", "en"],
    vatID: `NO${site.orgNumber.replace(/\s/g, "")}MVA`,
    foundingDate: "2011",
    slogan: "Håndverk med presisjon.",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        opens: "07:00",
        closes: "16:00"
      }
    ],
    sameAs: [site.social.instagram, site.social.linkedin],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tjenester",
      itemListElement: [
        "Nybygg og enebolig",
        "Tilbygg og påbygg",
        "Interiør og spesialsnekring",
        "Rehabilitering og vern",
        "Kommersielt og kultur",
        "Rådgivning og forprosjekt"
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name, serviceType: name }
      }))
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
