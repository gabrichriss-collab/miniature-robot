export type Service = {
  slug: string;
  title: string;
  lede: string;
  points: string[];
  kicker: string;
  /** Wood-toned gradient used as card background in the home services slider. */
  gradient: string;
};

export const services: Service[] = [
  {
    slug: "nybygg",
    kicker: "01 — Bolig",
    title: "Nybygg og enebolig",
    lede:
      "Fra tomtebefaring til overlevering. Vi bygger boliger av tre med presisjon, ro og respekt for stedet.",
    points: [
      "Prosjekterings- og byggeledelse",
      "Massivtre, bindingsverk og reisverk",
      "Tett hus, klimaskall og finish",
      "TEK17 og lavenergiløsninger"
    ],
    gradient: "linear-gradient(150deg,#1c1a17 0%,#3a3128 50%,#6b5b46 100%)"
  },
  {
    slug: "tilbygg",
    kicker: "02 — Utvidelse",
    title: "Tilbygg og påbygg",
    lede:
      "Vi lar det gamle møte det nye med samme håndverksmessige alvor. Detaljene bærer huset videre.",
    points: [
      "Skreddersydde tilbygg i tre",
      "Loftsutbygging og takløft",
      "Terrasser, uterom og fasader",
      "Antikvariske hensyn"
    ],
    gradient: "linear-gradient(150deg,#181c1a 0%,#3a4a3f 50%,#7c8c78 100%)"
  },
  {
    slug: "interior",
    kicker: "03 — Interiør",
    title: "Interiør og spesialsnekring",
    lede:
      "Kjøkken, garderobe, bibliotek. Møbler og fastinnredning tegnet og bygget for det ene rommet.",
    points: [
      "Fastmøbler i massivtre og finér",
      "Trapper, dører og listverk",
      "Overflater i olje, såpe og lasur",
      "Samarbeid med arkitekt"
    ],
    gradient: "linear-gradient(150deg,#1e1712 0%,#5a3d28 50%,#b58a5f 100%)"
  },
  {
    slug: "rehabilitering",
    kicker: "04 — Vern",
    title: "Rehabilitering og vern",
    lede:
      "Å bevare er å bygge langsomt. Vi tilbakefører vinduer, fasader og konstruksjoner med opprinnelige teknikker.",
    points: [
      "Vinduer og dører i tradisjonelt håndverk",
      "Panel, list og fasaderehab",
      "Bindingsverk og reparasjoner",
      "Riksantikvarens veiledere"
    ],
    gradient: "linear-gradient(150deg,#161311 0%,#4a3b30 55%,#9a8265 100%)"
  },
  {
    slug: "naering",
    kicker: "05 — Næring",
    title: "Kommersielt og kultur",
    lede:
      "Kafé, galleri, kontor. Interiør og innredning bygget for hverdagens slitasje og et rolig uttrykk.",
    points: [
      "Fastinnredning og bardisker",
      "Skillevegger og akustikk i tre",
      "Skilt og detaljer i messing/tre",
      "Prosjektering med byggeledelse"
    ],
    gradient: "linear-gradient(150deg,#14110e 0%,#3a2b1e 50%,#8a6a3f 100%)"
  },
  {
    slug: "raadgivning",
    kicker: "06 — Rådgivning",
    title: "Rådgivning og forprosjekt",
    lede:
      "Før spikeren treffer. Vi kommer på befaring, tegner opp muligheter og gir et grunnlag å bygge videre på.",
    points: [
      "Befaring og mulighetsstudie",
      "Kalkyle og fremdrift",
      "Materialvalg og bærekraft",
      "Søknad og dokumentasjon"
    ],
    gradient: "linear-gradient(150deg,#171614 0%,#3d3830 50%,#8a8377 100%)"
  }
];
