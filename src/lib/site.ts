export const site = {
  name: "Tømrer Kawiche",
  legalName: "Tømrer Kawiche AS",
  url: "https://tomrerkawiche.no",
  email: "post@tomrerkawiche.no",
  phone: "+47 900 00 000",
  phoneHref: "tel:+4790000000",
  orgNumber: "000 000 000",
  address: {
    street: "Tømrerveien 12",
    postal: "0000",
    city: "Oslo",
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
  }
} as const;
