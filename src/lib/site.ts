export const site = {
  name: "Tømrer Kawiche",
  legalName: "Tømrer Kawiche AS",
  url: "https://tomrerkawiche.no",
  email: "kontakt@tomrerkawiche.no",
  phone: "+47 92 12 82 53",
  phoneHref: "tel:+4792128253",
  orgNumber: "933 526 399",
  address: {
    street: "Uglåsvegen 26",
    postal: "5957",
    city: "Myking",
    region: "Vestland",
    country: "NO",
    countryName: "Norge"
  },
  openingHours: [
    { days: "Mandag – fredag", hours: "07 – 16" },
    { days: "Lørdag – søndag", hours: "Etter avtale" }
  ],
  social: {
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com"
  },
  // Norsk kontekst brukt i copy og strukturerte data
  areasServed: [
    "Nordhordland",
    "Alver",
    "Osterøy",
    "Modalen",
    "Masfjorden",
    "Austrheim",
    "Fedje",
    "Bergen",
    "Vestland"
  ]
} as const;
