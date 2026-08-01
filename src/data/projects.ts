export type Project = {
  slug: string;
  title: string;
  place: string;
  year: string;
  category: "Bolig" | "Tilbygg" | "Interiør" | "Næring" | "Rehabilitering";
  size: string;
  material: string;
  summary: string;
  gradient: string;
};

export const projects: Project[] = [
  {
    slug: "villa-furuli",
    title: "Villa Furuli",
    place: "Nordstrand, Oslo",
    year: "2024",
    category: "Bolig",
    size: "340 m²",
    material: "Massivtre, sedertre, ubehandlet ask",
    summary:
      "En enebolig i tre etasjer der massivtreet står synlig fra kjeller til mønet. Fasaden får patinere fritt.",
    gradient: "linear-gradient(120deg,#2a2622,#4a3f34 40%,#7a6a55)"
  },
  {
    slug: "hus-ved-fjorden",
    title: "Hus ved fjorden",
    place: "Bygdøy, Oslo",
    year: "2024",
    category: "Tilbygg",
    size: "72 m²",
    material: "Eik, zink, kalkpuss",
    summary:
      "Tilbygg til enebolig fra 1930-tallet. Møtet mellom nytt og gammelt løses med en sømløs kobling i eik.",
    gradient: "linear-gradient(120deg,#1c2320,#3a4a3f 55%,#7a8a75)"
  },
  {
    slug: "loftsleilighet-grunerlokka",
    title: "Loftsleilighet",
    place: "Grünerløkka, Oslo",
    year: "2023",
    category: "Interiør",
    size: "118 m²",
    material: "Ask, lin, brent tre",
    summary:
      "Totalrenovering av loftsleilighet med skreddersydd kjøkken og bibliotek i ask og linolje.",
    gradient: "linear-gradient(120deg,#201a15,#5a3d28 50%,#b58a5f)"
  },
  {
    slug: "kaffebrenneriet",
    title: "Kaffebrenneriet",
    place: "Sentrum, Oslo",
    year: "2023",
    category: "Næring",
    size: "210 m²",
    material: "Furu, messing, oljet stål",
    summary:
      "Kafé og brenneri med bardisk, hyller og skillevegger bygget på verkstedet vårt og montert på stedet.",
    gradient: "linear-gradient(120deg,#16130f,#3a2b1e 50%,#8a6a3f)"
  },
  {
    slug: "sveitservillaen",
    title: "Sveitservillaen",
    place: "Frogner, Oslo",
    year: "2022",
    category: "Rehabilitering",
    size: "410 m²",
    material: "Original furu, lin, tradisjonell maling",
    summary:
      "Tilbakeføring av fasade, vinduer og listverk. Alt utført i tradisjonelt håndverk etter Riksantikvaren.",
    gradient: "linear-gradient(120deg,#1a1614,#4a3b30 55%,#a08863)"
  },
  {
    slug: "atelier-i-hagen",
    title: "Atelier i hagen",
    place: "Ekeberg, Oslo",
    year: "2022",
    category: "Bolig",
    size: "48 m²",
    material: "Sedertre, gran, oljet gulv",
    summary:
      "Fritt liggende atelier i hagen — enkel geometri, høyt lys, materialene i naturlig aldring.",
    gradient: "linear-gradient(120deg,#151a17,#3a4a3f 55%,#8ea38a)"
  }
];
