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
    place: "Alversund, Alver",
    year: "2024",
    category: "Bolig",
    size: "340 m²",
    material: "Massivtre, sedertre, ubehandlet ask",
    summary:
      "Enebolig over tre etasjer med synlig massivtre fra kjeller til møne. Fasaden er ubehandlet og får gråne fritt.",
    gradient: "linear-gradient(120deg,#2a2622,#4a3f34 40%,#7a6a55)"
  },
  {
    slug: "hus-ved-fjorden",
    title: "Hus ved fjorden",
    place: "Meland, Alver",
    year: "2024",
    category: "Tilbygg",
    size: "72 m²",
    material: "Eik, zink, kalkpuss",
    summary:
      "Tilbygg til et hus fra 1930-tallet. Overgangen fra gammelt til nytt er løst med en fugefri kobling i eik.",
    gradient: "linear-gradient(120deg,#1c2320,#3a4a3f 55%,#7a8a75)"
  },
  {
    slug: "loftsleilighet-sandviken",
    title: "Loftsleilighet",
    place: "Sandviken, Bergen",
    year: "2023",
    category: "Interiør",
    size: "118 m²",
    material: "Ask, lin, brent tre",
    summary:
      "Totalrenovering av loftsleilighet. Kjøkken og bibliotek er tegnet spesielt for rommet, i ask med linolje.",
    gradient: "linear-gradient(120deg,#201a15,#5a3d28 50%,#b58a5f)"
  },
  {
    slug: "kaffebrenneriet",
    title: "Kaffebrenneriet",
    place: "Bergen sentrum",
    year: "2023",
    category: "Næring",
    size: "210 m²",
    material: "Furu, messing, oljet stål",
    summary:
      "Kafé og brenneri. Bardisk, hyller og skillevegger ble bygget hos oss og fraktet inn ferdig.",
    gradient: "linear-gradient(120deg,#16130f,#3a2b1e 50%,#8a6a3f)"
  },
  {
    slug: "sveitservillaen",
    title: "Sveitservillaen",
    place: "Nordnes, Bergen",
    year: "2022",
    category: "Rehabilitering",
    size: "410 m²",
    material: "Original furu, lin, tradisjonell maling",
    summary:
      "Tilbakeføring av fasade, vinduer og listverk etter Riksantikvarens veiledere — i tradisjonelt håndverk hele veien.",
    gradient: "linear-gradient(120deg,#1a1614,#4a3b30 55%,#a08863)"
  },
  {
    slug: "atelier-i-hagen",
    title: "Atelier i hagen",
    place: "Osterøy",
    year: "2022",
    category: "Bolig",
    size: "48 m²",
    material: "Sedertre, gran, oljet gulv",
    summary:
      "Frittstående atelier i hagen. Enkel form, mye lys, og materialer som får eldes uten behandling.",
    gradient: "linear-gradient(120deg,#151a17,#3a4a3f 55%,#8ea38a)"
  }
];
