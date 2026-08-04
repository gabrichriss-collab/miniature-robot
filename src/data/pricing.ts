/**
 * Priser og kalkulasjonsgrunnlag for Tømrer Kawiche sitt prisestimat.
 *
 * VIKTIG:
 * - Prisene her er utgangspunkt for et *prisestimat* — ikke bindende tilbud.
 *   Endelig tilbud gis skriftlig etter befaring.
 * - Alle priser er eks. MVA (25 %) og eks. påslag (20 %).
 * - Rediger prisene under for å reflektere Tømrer Kawiche sine reelle rater.
 *   Ingen kodendring nødvendig ellers.
 * - "Tilbygg og påbygg" bruker fortsatt befaring — legg til m²-rader her
 *   når rater er kartlagt.
 */

export const VAT_PERCENT = 25;
export const DEFAULT_MARKUP_PERCENT = 20;

export const UNITS = [
  "m²",
  "m",
  "lm",
  "cm",
  "mm",
  "stk",
  "RS",
  "tur",
  "timer",
  "pak",
  "kg",
  "uker"
] as const;

export type PriceUnit = (typeof UNITS)[number];

export type PriceEntry = {
  /** Norske søkeord som utløser fuzzy-match i inntastingsfeltet. */
  keywords: string[];
  unit: PriceUnit;
  price: number;
  name: string;
  note?: string;
  cat: string;
};

export const PRICE_DB: PriceEntry[] = [
  // ── TERRASSE ──────────────────────────────────────────────────────
  {
    keywords: ["terrasse", "terasse", "deck", "platting"],
    unit: "m²",
    price: 1650,
    name: "Bygging av terrasse (standard)",
    note: "Inkl. bjelkelag, terrassebord",
    cat: "Terrasse"
  },
  {
    keywords: [
      "terrasse skjult",
      "camo",
      "skjult innfesting",
      "skjult feste"
    ],
    unit: "m²",
    price: 1950,
    name: "Terrasse m/ skjult innfesting",
    note: "Camo/tilsvarende system",
    cat: "Terrasse"
  },
  {
    keywords: [
      "termofuru",
      "termo furu",
      "kebony",
      "accoya",
      "termoterrasse"
    ],
    unit: "m²",
    price: 2200,
    name: "Terrasse m/ termofuru",
    note: "Premium materialer",
    cat: "Terrasse"
  },
  {
    keywords: [
      "riv terrasse",
      "rive terrasse",
      "riving terrasse",
      "demontere terrasse",
      "demontering terrasse"
    ],
    unit: "m²",
    price: 440,
    name: "Riving av terrasse",
    note: "Inkl. bortkjøring",
    cat: "Terrasse"
  },
  {
    keywords: ["rekkverk tre", "gelender tre", "terrasse rekkverk"],
    unit: "lm",
    price: 1800,
    name: "Rekkverk (tre)",
    note: "Inkl. stolper og håndlist",
    cat: "Terrasse"
  },
  {
    keywords: ["rekkverk glass", "glass rekkverk", "glassrekkverk"],
    unit: "lm",
    price: 3200,
    name: "Rekkverk m/ glass",
    note: "Herdet glass",
    cat: "Terrasse"
  },

  // ── KLEDNING & FASADE ────────────────────────────────────────────
  {
    keywords: ["kledning", "ytterkledning", "fasadekledning", "kled"],
    unit: "m²",
    price: 1200,
    name: "Utvendig kledning",
    note: "Gran, grunnet",
    cat: "Kledning"
  },
  {
    keywords: ["stående kledning", "stående panel"],
    unit: "m²",
    price: 1100,
    name: "Stående kledning",
    note: "Gran, grunnet",
    cat: "Kledning"
  },
  {
    keywords: [
      "riv kledning",
      "rive kledning",
      "riving kledning",
      "fjerne kledning"
    ],
    unit: "m²",
    price: 350,
    name: "Riving av kledning",
    cat: "Kledning"
  },
  {
    keywords: [
      "etterisoler",
      "etterisolering",
      "tilleggsisoler",
      "isoler vegg",
      "isolering vegg",
      "isoler fasade"
    ],
    unit: "m²",
    price: 2800,
    name: "Etterisolering + ny kledning",
    note: "Vindsperre, lekting, kledning",
    cat: "Kledning"
  },
  {
    keywords: ["panel innvendig", "innvendig panel", "veggpanel"],
    unit: "m²",
    price: 850,
    name: "Panel innvendig",
    note: "Furu/gran",
    cat: "Kledning"
  },
  {
    keywords: [
      "maling",
      "beising",
      "male",
      "beise",
      "maler",
      "fasademaling"
    ],
    unit: "m²",
    price: 380,
    name: "Maling/beising utvendig",
    note: "2 strøk",
    cat: "Kledning"
  },

  // ── VINDUER & DØRER ───────────────────────────────────────────────
  {
    keywords: [
      "vindu",
      "vindue",
      "monter vindu",
      "sett inn vindu",
      "skifte vindu",
      "bytte vindu"
    ],
    unit: "stk",
    price: 5500,
    name: "Montering vindu (standard)",
    note: "Inkl. foring og listeverk",
    cat: "Vinduer"
  },
  {
    keywords: [
      "stort vindu",
      "fasadevindu",
      "stort vindue",
      "monter stort"
    ],
    unit: "stk",
    price: 8800,
    name: "Montering vindu (stort)",
    note: "Over 1,5 m²",
    cat: "Vinduer"
  },
  {
    keywords: [
      "terrassedør",
      "terrasse dør",
      "dobbeldør",
      "dobbel dør",
      "balkongdør"
    ],
    unit: "stk",
    price: 9500,
    name: "Montering terrassedør",
    note: "Dobbel, inkl. listeverk",
    cat: "Vinduer"
  },
  {
    keywords: ["skyvedør", "skyvdør", "glasskyvedør"],
    unit: "stk",
    price: 12000,
    name: "Montering skyvedør",
    note: "Inkl. skinner, listeverk",
    cat: "Vinduer"
  },
  {
    keywords: ["ytterdør", "inngangsdør", "hoveddør"],
    unit: "stk",
    price: 7500,
    name: "Montering ytterdør",
    note: "Standard",
    cat: "Vinduer"
  },
  {
    keywords: [
      "demonter dør",
      "rive dør",
      "fjerne dør",
      "demonter vindu",
      "rive vindu",
      "fjerne vindu"
    ],
    unit: "stk",
    price: 1500,
    name: "Demontering dør/vindu",
    cat: "Vinduer"
  },

  // ── TAK ───────────────────────────────────────────────────────────
  {
    keywords: [
      "tak",
      "taktekking",
      "tekke tak",
      "takstein",
      "legge tak"
    ],
    unit: "m²",
    price: 1400,
    name: "Taktekking (takstein)",
    note: "Inkl. lekting, undertak",
    cat: "Tak"
  },
  {
    keywords: ["ståltak", "stålplate", "metalltak", "bølgeblikk"],
    unit: "m²",
    price: 950,
    name: "Taktekking (stålplater)",
    note: "Inkl. undertak",
    cat: "Tak"
  },
  {
    keywords: ["takrenne", "takrenner", "nedløp"],
    unit: "lm",
    price: 650,
    name: "Takrenner",
    note: "Aluminium, inkl. nedløp",
    cat: "Tak"
  },
  {
    keywords: ["isoler tak", "takisolering", "etterisoler tak"],
    unit: "m²",
    price: 900,
    name: "Etterisolering tak",
    note: "Mineralull",
    cat: "Tak"
  },
  {
    keywords: ["rive tak", "riving tak", "fjerne tak", "demontere tak"],
    unit: "m²",
    price: 500,
    name: "Riving av tak",
    cat: "Tak"
  },

  // ── GULV ──────────────────────────────────────────────────────────
  {
    keywords: ["parkett", "tregulv", "heltre"],
    unit: "m²",
    price: 1100,
    name: "Parkett (heltre)",
    note: "Inkl. underlag",
    cat: "Gulv"
  },
  {
    keywords: ["laminat", "laminatgulv"],
    unit: "m²",
    price: 650,
    name: "Laminat",
    note: "Inkl. underlag",
    cat: "Gulv"
  },
  {
    keywords: ["flis", "fliser", "flislegging", "legge flis"],
    unit: "m²",
    price: 1800,
    name: "Flislegging (gulv)",
    note: "Inkl. membran, lim",
    cat: "Gulv"
  },
  {
    keywords: ["vinyl", "vinylgulv", "klikkvinyl"],
    unit: "m²",
    price: 550,
    name: "Vinylgulv",
    note: "Klikk-vinyl",
    cat: "Gulv"
  },
  {
    keywords: ["slip", "slipe", "sliping", "slipegulv", "slip gulv"],
    unit: "m²",
    price: 450,
    name: "Sliping av tregulv",
    note: "Inkl. lakk/olje",
    cat: "Gulv"
  },
  {
    keywords: ["rive gulv", "riving gulv", "fjerne gulv"],
    unit: "m²",
    price: 280,
    name: "Riving av gulv",
    cat: "Gulv"
  },

  // ── VEGGER ────────────────────────────────────────────────────────
  {
    keywords: [
      "letvegg",
      "lettvegg",
      "innvegg",
      "skillevegg",
      "gipsvegg",
      "sett opp vegg",
      "bygge vegg"
    ],
    unit: "m²",
    price: 1200,
    name: "Letvegg m/ gips",
    note: "Stender, isolasjon, gips",
    cat: "Vegger"
  },
  {
    keywords: ["lydvegg", "dobbel gips"],
    unit: "m²",
    price: 1600,
    name: "Letvegg (lydvegg)",
    note: "Dobbel gips",
    cat: "Vegger"
  },
  {
    keywords: ["rive vegg", "riving vegg", "fjerne vegg"],
    unit: "m²",
    price: 400,
    name: "Riving av vegg",
    cat: "Vegger"
  },
  {
    keywords: ["gipsing", "gips", "sparkling", "sparkle"],
    unit: "m²",
    price: 550,
    name: "Gipsing",
    note: "Inkl. sparkling",
    cat: "Vegger"
  },
  {
    keywords: [
      "flis vegg",
      "flislegging vegg",
      "våtrom flis",
      "bad flis"
    ],
    unit: "m²",
    price: 1600,
    name: "Flislegging (vegg)",
    note: "Våtrom, inkl. membran",
    cat: "Vegger"
  },

  // ── DIVERSE ───────────────────────────────────────────────────────
  {
    keywords: ["levegg", "le-vegg", "vindskjerm"],
    unit: "lm",
    price: 3500,
    name: "Levegg (tre)",
    cat: "Diverse"
  },
  {
    keywords: ["levegg glass", "glass levegg", "glassvindskjerm"],
    unit: "lm",
    price: 5500,
    name: "Levegg m/ glass",
    note: "Herdet glass",
    cat: "Diverse"
  },
  {
    keywords: [
      "trapp ute",
      "utvendig trapp",
      "utetrapp",
      "inngangs trapp"
    ],
    unit: "stk",
    price: 18000,
    name: "Trapp (utvendig)",
    note: "Inkl. rekkverk",
    cat: "Diverse"
  },
  {
    keywords: ["trapp inne", "innvendig trapp", "inne trapp"],
    unit: "stk",
    price: 35000,
    name: "Trapp (innvendig)",
    note: "Standard rett trapp",
    cat: "Diverse"
  },
  {
    keywords: [
      "bod",
      "skur",
      "redskapsbod",
      "bygge bod",
      "bygge skur"
    ],
    unit: "m²",
    price: 8500,
    name: "Bod/skur",
    note: "Nøkkelferdig",
    cat: "Diverse"
  },
  {
    keywords: ["stillas", "stilas", "leie stillas"],
    unit: "m²",
    price: 720,
    name: "Stillas",
    note: "Per uke",
    cat: "Diverse"
  },
  {
    keywords: ["transport", "frakt", "kjøre", "kjøring", "henting"],
    unit: "tur",
    price: 1200,
    name: "Transport",
    note: "Materialer/verktøy",
    cat: "Diverse"
  },
  {
    keywords: [
      "avfall",
      "container",
      "søppel",
      "deponi",
      "bortkjøring",
      "kast"
    ],
    unit: "stk",
    price: 3500,
    name: "Avfallshåndtering",
    note: "Container + levering",
    cat: "Diverse"
  },

  // ── BAD / VÅTROM ──────────────────────────────────────────────────
  {
    keywords: ["membran gulv", "gulvmembran", "smøremembran gulv"],
    unit: "m²",
    price: 950,
    name: "Membran gulv (våtrom)",
    note: "Inkl. hjørneforsterkning",
    cat: "Bad"
  },
  {
    keywords: ["membran vegg", "veggmembran", "smøremembran vegg"],
    unit: "m²",
    price: 850,
    name: "Membran vegg (våtrom)",
    cat: "Bad"
  },
  {
    keywords: ["gulvvarme", "varmekabler", "gulvvarme kabler"],
    unit: "m²",
    price: 1500,
    name: "Gulvvarme (kabler)",
    note: "Elektrisk, inkl. tynnavretting",
    cat: "Bad"
  },
  {
    keywords: [
      "dusjnisje",
      "dusjhjørne",
      "dusjsone",
      "bygge dusj",
      "walk-in dusj"
    ],
    unit: "stk",
    price: 18000,
    name: "Dusjnisje / dusjhjørne",
    note: "Fall, membran, flis-fundament",
    cat: "Bad"
  },
  {
    keywords: ["dusjkabinett", "dusjhytte", "prefab dusj"],
    unit: "stk",
    price: 8500,
    name: "Montering dusjkabinett",
    note: "Ferdig produkt",
    cat: "Bad"
  },
  {
    keywords: [
      "bad innredning",
      "baderomsinnredning",
      "vaskeplass",
      "servantskap"
    ],
    unit: "lm",
    price: 6500,
    name: "Bad-innredning (fastmøbler)",
    note: "Vask, speil og skap",
    cat: "Bad"
  },
  {
    keywords: ["toalett", "wc", "toalettmontering"],
    unit: "stk",
    price: 4500,
    name: "Toalett — montering",
    note: "Inkl. tilkoblinger, ekskl. armatur",
    cat: "Bad"
  },
  {
    keywords: ["badekar", "boblebad", "innfelt badekar"],
    unit: "stk",
    price: 12000,
    name: "Badekar — montering",
    note: "Fritt­stående eller innfelt",
    cat: "Bad"
  },

  // ── KJØKKEN ───────────────────────────────────────────────────────
  {
    keywords: [
      "kjøkken",
      "kjøkkenmontering",
      "kjøkkeninstallasjon",
      "montering kjøkken"
    ],
    unit: "lm",
    price: 3200,
    name: "Kjøkkenmontering (standard)",
    note: "Skap fra fabrikk, ferdig levert",
    cat: "Kjøkken"
  },
  {
    keywords: [
      "skreddersydd kjøkken",
      "spesialkjøkken",
      "håndverksmøbel kjøkken",
      "eget kjøkken"
    ],
    unit: "lm",
    price: 8500,
    name: "Skreddersydd kjøkken",
    note: "Egen produksjon på verkstedet",
    cat: "Kjøkken"
  },
  {
    keywords: ["benkeplate laminat", "laminatbenkeplate"],
    unit: "lm",
    price: 2200,
    name: "Benkeplate — laminat",
    note: "Inkl. tilpasning og montering",
    cat: "Kjøkken"
  },
  {
    keywords: [
      "benkeplate tre",
      "benkeplate massivtre",
      "benkeplate eik",
      "benkeplate ask"
    ],
    unit: "lm",
    price: 6800,
    name: "Benkeplate — massivtre",
    note: "Egen produksjon, oljet",
    cat: "Kjøkken"
  },
  {
    keywords: [
      "benkeplate stein",
      "corian",
      "kompaktlaminat",
      "granittbenkeplate"
    ],
    unit: "lm",
    price: 6500,
    name: "Benkeplate — stein/kompakt",
    note: "Ekskl. materialkost",
    cat: "Kjøkken"
  },
  {
    keywords: ["ventilator", "kjøkkenvifte", "avtrekk", "kjøkkenavtrekk"],
    unit: "stk",
    price: 4500,
    name: "Ventilator — montering",
    note: "Inkl. utblåsning",
    cat: "Kjøkken"
  },
  {
    keywords: ["kjøkkenkran", "blandebatteri", "vaskekran"],
    unit: "stk",
    price: 2500,
    name: "Kjøkkenkran — montering",
    note: "Ekskl. armatur",
    cat: "Kjøkken"
  },

  // ── INNREDNING / FASTMØBLER ───────────────────────────────────────
  {
    keywords: [
      "garderobe",
      "garderobeskap",
      "innebygd garderobe",
      "fastmontert garderobe"
    ],
    unit: "lm",
    price: 6500,
    name: "Garderobe (standard)",
    note: "Hylle, stang og skyvedører",
    cat: "Innredning"
  },
  {
    keywords: [
      "skreddersydd garderobe",
      "spesialgarderobe",
      "walk-in",
      "walkin"
    ],
    unit: "lm",
    price: 12000,
    name: "Skreddersydd garderobe",
    note: "Etter mål, egen produksjon",
    cat: "Innredning"
  },
  {
    keywords: ["bokhylle", "vegghylle", "hylle-vegg"],
    unit: "lm",
    price: 8500,
    name: "Bokhylle (skreddersydd)",
    note: "Massivtre, montert",
    cat: "Innredning"
  },
  {
    keywords: ["bibliotek", "vegg til vegg hylle", "helvegghylle"],
    unit: "lm",
    price: 11000,
    name: "Bibliotek / vegg-til-vegg",
    note: "Skreddersydd, egen produksjon",
    cat: "Innredning"
  },
  {
    keywords: ["innebygd benk", "vindus benk", "kubbevegg"],
    unit: "lm",
    price: 5500,
    name: "Innebygd benk",
    note: "Med oppbevaring",
    cat: "Innredning"
  },
  {
    keywords: ["skyvedørssystem", "skyvedør garderobe", "skyvedører rom"],
    unit: "stk",
    price: 12000,
    name: "Skyvedørssystem",
    note: "Inkl. spor og dører",
    cat: "Innredning"
  },
  {
    keywords: ["tv benk", "tv møbel", "tv innredning", "mediemøbel"],
    unit: "lm",
    price: 8500,
    name: "TV-benk (skreddersydd)",
    note: "Med kabelkanal",
    cat: "Innredning"
  },

  // ── UTEROM ────────────────────────────────────────────────────────
  {
    keywords: ["pergola", "solskjerming ute", "hagelysthus"],
    unit: "m²",
    price: 5500,
    name: "Pergola (tre)",
    note: "Furu, oljet",
    cat: "Uterom"
  },
  {
    keywords: ["pergola glasstak", "pergola m glasstak", "overbygd pergola"],
    unit: "m²",
    price: 8500,
    name: "Pergola m/ glasstak",
    note: "Herdet glass",
    cat: "Uterom"
  },
  {
    keywords: ["drivhus", "veksthus", "vinterhage"],
    unit: "stk",
    price: 45000,
    name: "Drivhus — montering",
    note: "Ferdig kit, ekskl. produkt",
    cat: "Uterom"
  },
  {
    keywords: ["spa terrasse", "hot tub terrasse", "boblebad terrasse"],
    unit: "m²",
    price: 2800,
    name: "Spa-terrasse (forsterket)",
    note: "Ekstra bjelker + membran",
    cat: "Uterom"
  },
  {
    keywords: ["utegulv", "hagegulv", "tredekk hage", "gulv ute"],
    unit: "m²",
    price: 1750,
    name: "Utegulv i tre",
    note: "Bakkeplate, bjelker, bord",
    cat: "Uterom"
  },
  {
    keywords: ["utedusj", "utedusj innramming", "utendørs dusj"],
    unit: "stk",
    price: 8500,
    name: "Utedusj — innramming",
    note: "Vegg + gulvsluk",
    cat: "Uterom"
  },

  // ── GARASJE ───────────────────────────────────────────────────────
  {
    keywords: ["garasje", "garasje nøkkelferdig", "bygge garasje"],
    unit: "m²",
    price: 18000,
    name: "Garasje (nøkkelferdig)",
    note: "Fundament, vegger, tak",
    cat: "Garasje"
  },
  {
    keywords: ["carport", "biltak", "åpen garasje"],
    unit: "m²",
    price: 9500,
    name: "Carport (åpen)",
    note: "Bindingsverk, tak, kledning",
    cat: "Garasje"
  },
  {
    keywords: [
      "garasjeport",
      "vippeport",
      "montering garasjeport",
      "portmontering"
    ],
    unit: "stk",
    price: 6500,
    name: "Garasjeport (vippeport)",
    note: "Elektrisk, ekskl. produkt",
    cat: "Garasje"
  },
  {
    keywords: ["leddport", "seksjonsport", "isolert garasjeport"],
    unit: "stk",
    price: 8500,
    name: "Garasjeport (leddport)",
    note: "Isolert, elektrisk",
    cat: "Garasje"
  },
  {
    keywords: ["loftsbjelker garasje", "hems garasje", "loft garasje"],
    unit: "m²",
    price: 950,
    name: "Loftsbjelker garasje",
    note: "Oppbevaring over parkering",
    cat: "Garasje"
  },

  // ── FASADE ────────────────────────────────────────────────────────
  {
    keywords: ["vindsperre", "vindsperre montering", "vindsperre fasade"],
    unit: "m²",
    price: 320,
    name: "Vindsperre — montering",
    note: "Inkl. teiping",
    cat: "Fasade"
  },
  {
    keywords: ["utlekting", "sløyfer og lekter", "luftespalte lekter"],
    unit: "m²",
    price: 250,
    name: "Utlekting for luftespalte",
    note: "Trykk-impregnert",
    cat: "Fasade"
  },
  {
    keywords: ["sokkelbeslag", "sokkel beslag", "grunnmurbeslag"],
    unit: "lm",
    price: 620,
    name: "Sokkelbeslag",
    note: "Aluminium",
    cat: "Fasade"
  },
  {
    keywords: ["vannbord", "dryppnese", "vindus beslag"],
    unit: "lm",
    price: 380,
    name: "Vannbord (dryppnese)",
    cat: "Fasade"
  },
  {
    keywords: [
      "vindsperre tak",
      "undertak diffusjon",
      "diffusjonsåpent undertak"
    ],
    unit: "m²",
    price: 280,
    name: "Vindsperre tak",
    note: "Sjikt over sperrer",
    cat: "Fasade"
  },

  // ── ISOLASJON ─────────────────────────────────────────────────────
  {
    keywords: [
      "loftisolering",
      "blåst mineralull",
      "isoler loft",
      "hyttetak isolering"
    ],
    unit: "m²",
    price: 550,
    name: "Etterisolering loft",
    note: "Blåst mineralull, åpen loft",
    cat: "Isolasjon"
  },
  {
    keywords: [
      "kryperom isolasjon",
      "kryperom",
      "gulvisolering under",
      "isolere gulv under"
    ],
    unit: "m²",
    price: 780,
    name: "Isolering av kryperom",
    note: "Steinull + dampsperre",
    cat: "Isolasjon"
  },
  {
    keywords: ["kjellervegg utvendig", "isolere kjeller ute", "xps kjeller"],
    unit: "m²",
    price: 1200,
    name: "Kjellervegg — utvendig isolasjon",
    note: "XPS + puss",
    cat: "Isolasjon"
  },
  {
    keywords: ["kjellervegg innvendig", "isolere kjeller inne", "kjeller gips"],
    unit: "m²",
    price: 950,
    name: "Kjellervegg — innvendig isolasjon",
    note: "Isolasjon + gips",
    cat: "Isolasjon"
  },
  {
    keywords: [
      "gulv over kaldt rom",
      "isolere gulv kryperom",
      "gulvisolering over kjeller"
    ],
    unit: "m²",
    price: 620,
    name: "Isolering av gulv (over kaldt rom)",
    note: "Mineralull mellom bjelker",
    cat: "Isolasjon"
  },

  // ── REHAB (utvidet) ───────────────────────────────────────────────
  {
    keywords: [
      "bytte råtne stokker",
      "råteskadet tømmer",
      "rotskade",
      "råteskade"
    ],
    unit: "stk",
    price: 18000,
    name: "Bytte råtne stokker",
    note: "Vurderes per stokk etter befaring",
    cat: "Rehab"
  },
  {
    keywords: ["nytt bindingsverk", "bindingsverk vegg", "reisverk vegg"],
    unit: "m²",
    price: 2400,
    name: "Nytt bindingsverk (vegg)",
    note: "Ekskl. kledning",
    cat: "Rehab"
  },
  {
    keywords: [
      "takstoler",
      "sperrer",
      "nytt takverk",
      "nytt spærreverk"
    ],
    unit: "m²",
    price: 2800,
    name: "Nye takstoler / sperrer",
    note: "Bygging inn på plass",
    cat: "Rehab"
  },
  {
    keywords: [
      "undertak",
      "nytt undertak",
      "undertak dampsperre",
      "undertaksplate"
    ],
    unit: "m²",
    price: 1400,
    name: "Nytt undertak",
    note: "Dampsperre + isolasjon",
    cat: "Rehab"
  },
  {
    keywords: [
      "sprossevindu",
      "sprosser",
      "kopi vindu",
      "vindu original stil"
    ],
    unit: "stk",
    price: 18000,
    name: "Sprossevindu (kopi)",
    note: "Håndverk i original stil",
    cat: "Rehab"
  },
  {
    keywords: [
      "restaurering vindu",
      "vindusrestaurering",
      "originalt vindu restaurering"
    ],
    unit: "stk",
    price: 8500,
    name: "Restaurering av originalt vindu",
    note: "Bevaring, riksantikvarveiledning",
    cat: "Rehab"
  },
  {
    keywords: [
      "restaurering dør",
      "dørsrestaurering",
      "originaldør restaurering"
    ],
    unit: "stk",
    price: 12000,
    name: "Restaurering av originaldør",
    note: "Bevaring, riksantikvarveiledning",
    cat: "Rehab"
  }
];

/**
 * Kategorier som krever befaring før prising kan gis. Vises som informative
 * kort i browse-modalen med lenke til /kontakt, men uten linje-priser.
 * TODO(tømrerkawiche): fyll inn m²-priser etter research og flytt inn i PRICE_DB.
 */
export const NEEDS_SURVEY: Array<{ label: string; note: string }> = [
  {
    label: "Tilbygg og påbygg",
    note: "Prises per m² etter befaring — kompleksitet, fundamentering og tilknytning varierer."
  },
  {
    label: "Nybygg og enebolig",
    note: "Prises som totalentreprise etter tegninger og befaring."
  },
  {
    label: "Loftsutbygging",
    note: "Prises per m² etter takløft-krav og eventuell våtromsinstallasjon."
  }
];
