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
      "Vi bygger nye boliger i tre — fra tomtebefaring til nøkkelen leveres. Alt planlagt, tegnet og satt opp i tett dialog med deg som byggherre.",
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
      "Skal huset utvides eller løftes med en etasje? Vi tar det nye på alvor og respekterer det som allerede står. Det er i skjøtene mellom gammelt og nytt jobben avgjøres.",
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
      "Kjøkken, garderober, bokhyller. Vi tegner og bygger fastinnredning på verkstedet vårt og monterer det hjemme hos deg.",
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
      "Gamle hus krever tid og respekt. Vi tilbakefører vinduer, panel og konstruksjoner slik det opprinnelig ble gjort — der det er riktig å gjøre det.",
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
      "Kafé, galleri, kontor. Vi bygger innredning som tåler daglig slitasje uten at det synes.",
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
      "Før spikeren treffer treet. Vi kommer på befaring, ser på mulighetene og gir deg et ærlig grunnlag å ta beslutninger på.",
    points: [
      "Befaring og mulighetsstudie",
      "Kalkyle og fremdrift",
      "Materialvalg og bærekraft",
      "Søknad og dokumentasjon"
    ],
    gradient: "linear-gradient(150deg,#171614 0%,#3d3830 50%,#8a8377 100%)"
  }
];
