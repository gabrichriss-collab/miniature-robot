import "server-only";
// Denne modulen inneholder kommersiell prisintelligens og skal ALDRI
// havne i nettleseren. `server-only` gjoer et slikt import til en
// byggefeil i stedet for en stille lekkasje.

/**
 * MATERIALDATABASE — veiledende norske referansepriser.
 *
 * VIKTIG OM PRISNIVÅET
 * Dette er ESTIMATOR-REFERANSEPRISER, bevisst satt konservativt. De er
 * IKKE de billigste kampanjeprisene på nett. Hensikten med Prisestimat er
 * å unngå å underestimere materialkostnaden. Ikke bytt disse ut med
 * tilfeldige lavpriser.
 *
 * Eventuelle proffrabatter selskapet får hos leverandør tilhører
 * virksomheten og skal ikke automatisk redusere kundens nettestimat.
 *
 * MVA
 * `referenceRetailPriceInclVat` legges inn slik prisen står i butikk
 * (inkl. mva). Internt normaliseres alt til eks. mva:
 *
 *   referencePriceExVat = referenceRetailPriceInclVat / (1 + vatRate)
 *
 * Denne konverteringen skjer i `defineMaterial()` under, slik at vi aldri
 * blander mva-belagte materialtall med arbeidspriser eks. mva.
 */

import { pricingSettings } from "./settings";

export type MaterialUnit = "lm" | "m²" | "stk" | "kg" | "pk";

export type MaterialCategory =
  | "Terrassebord"
  | "Kledning"
  | "Konstruksjonsvirke"
  | "Festemidler"
  | "Vindsperre"
  | "Isolasjon"
  | "Gulvunderlag"
  | "Listverk"
  | "Plater"
  | "Gulv";

/** Kvalitetsnivå materialet hører hjemme i. */
export type MaterialQuality = "standard" | "premium";

export type MaterialInput = {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  /**
   * Veiledende utsalgspris inkl. mva, per `unit`.
   * `null` betyr at vi IKKE har en verifisert pris ennå. Da regnes
   * materialet aldri inn i en sum — det vises som en navngitt post som
   * avklares. Vi gjetter ikke.
   */
  referenceRetailPriceInclVat: number | null;
  /** Andel svinn (0.10 = 10 %). Faller tilbake på global standard. */
  wasteFactor?: number;
  /** Andel prisbuffer (0.10 = 10 %). Faller tilbake på global standard. */
  protectionFactor?: number;
  /** ISO-dato for når prisen sist ble kontrollert. */
  lastUpdated: string;
  materialTier: MaterialQuality;
  sourceNotes: string;
  /** Kundevendt forklaring når prisen mangler. */
  pendingReason?: string;
  /** Produktmetadata — internt, vises ikke som leverandørinfo for kunden. */
  dimension?: string;
  profile?: string;
  orientation?: "vertical" | "horizontal";
  /** Standardforbruk per m² der produktet har ett. */
  consumptionLmPerM2?: number;
};

export type Material = Omit<MaterialInput, "wasteFactor" | "protectionFactor"> & {
  /** Avledet: referanseprisen normalisert til eks. mva. 0 når pris mangler. */
  referencePriceExVat: number;
  wasteFactor: number;
  protectionFactor: number;
  /** True når vi mangler verifisert pris og derfor ikke kan prise posten. */
  pricePending: boolean;
};

/** Normaliserer til eks. mva og fyller inn globale standardverdier. */
function defineMaterial(m: MaterialInput): Material {
  const { wasteFactor, protectionFactor, ...rest } = m;
  const price = m.referenceRetailPriceInclVat;
  return {
    ...rest,
    referencePriceExVat:
      price == null ? 0 : price / (1 + pricingSettings.vatRate),
    wasteFactor: wasteFactor ?? pricingSettings.defaultMaterialWaste,
    protectionFactor:
      protectionFactor ?? pricingSettings.defaultMaterialProtection,
    pricePending: price == null
  };
}

const RETAIL_SOURCE =
  "Konservativ norsk referansepris basert på flere byggevarekjeder, ikke kampanjepris.";

const PRICE_DATE = "2026-09-16";

const MATERIAL_LIST: Material[] = [
  // ── TERRASSEBORD ──────────────────────────────────────────────────
  defineMaterial({
    id: "terrace_standard_impregnated",
    name: "Terrassebord 28×120 trykkimpregnert",
    category: "Terrassebord",
    unit: "lm",
    referenceRetailPriceInclVat: 21,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),
  defineMaterial({
    id: "terrace_royal",
    name: "Terrassebord 28×120 Royal",
    category: "Terrassebord",
    unit: "lm",
    referenceRetailPriceInclVat: 43,
    lastUpdated: PRICE_DATE,
    materialTier: "premium",
    sourceNotes: RETAIL_SOURCE
  }),
  defineMaterial({
    id: "terrace_thermowood",
    name: "Terrassebord termofuru",
    category: "Terrassebord",
    unit: "lm",
    // THERMOWOOD_PRICE_PENDING — ingen verifisert norsk referansepris.
    // Royal-prisen skal IKKE brukes som erstatning.
    referenceRetailPriceInclVat: null,
    lastUpdated: PRICE_DATE,
    materialTier: "premium",
    sourceNotes:
      "Ingen verifisert referansepris lagt inn. Gjelder også Kebony og Accoya.",
    pendingReason: "Materialpris beregnes etter valgt produkt."
  }),

  // ── KONSTRUKSJONSVIRKE ────────────────────────────────────────────
  defineMaterial({
    id: "timber_48x148_imp",
    name: "Konstruksjonsvirke 48×148 trykkimpregnert C24",
    category: "Konstruksjonsvirke",
    unit: "lm",
    referenceRetailPriceInclVat: 49,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),
  defineMaterial({
    id: "timber_48x98_imp",
    name: "Konstruksjonsvirke 48×98 trykkimpregnert C24",
    category: "Konstruksjonsvirke",
    unit: "lm",
    referenceRetailPriceInclVat: 33,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),
  defineMaterial({
    id: "batten_36x48_imp",
    name: "Lekt 36×48 trykkimpregnert",
    category: "Konstruksjonsvirke",
    unit: "lm",
    referenceRetailPriceInclVat: 25,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),

  // ── FESTEMIDLER ───────────────────────────────────────────────────
  defineMaterial({
    id: "terrace_screws_c4",
    name: "Terrasseskruer C4",
    category: "Festemidler",
    unit: "stk",
    // 330 kr per 1000 skruer inkl. mva → 0,33 kr/stk inkl. mva.
    referenceRetailPriceInclVat: 330 / 1000,
    wasteFactor: 0.05,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes:
      "330 kr per 1000 skruer inkl. mva. Konservativ norsk referansepris."
  }),

  defineMaterial({
    id: "terrace_hidden_fastening",
    name: "Skjult terrasseskrue (CAMO ProTech C4)",
    category: "Festemidler",
    unit: "stk",
    referenceRetailPriceInclVat: 1.7,
    wasteFactor: 0.05,
    lastUpdated: PRICE_DATE,
    materialTier: "premium",
    sourceNotes: "Konservativ norsk referansepris, september 2026."
    // Monteringsverktøy / Marksman-jigg er gjenbrukbart firmautstyr og
    // belastes ALDRI kundens materialestimat.
  }),

  // ── KLEDNING ──────────────────────────────────────────────────────
  defineMaterial({
    id: "cladding_19x148_rectangular",
    name: "Stående kledning 19×148, grunnet gran",
    category: "Kledning",
    unit: "lm",
    referenceRetailPriceInclVat: 50,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    dimension: "19x148",
    profile: "rectangular",
    orientation: "vertical",
    consumptionLmPerM2: 8.13,
    sourceNotes:
      "Konservativ referanse, satt over normalt norsk utsalgsnivå for 19×148 rektangulær grunnet stående grankledning, september 2026."
  }),
  defineMaterial({
    id: "cladding_fasteners",
    name: "Kledningsspiker / festemidler",
    category: "Festemidler",
    unit: "m²",
    // FASTENER_PRICE_PENDING
    referenceRetailPriceInclVat: null,
    wasteFactor: 0.05,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: "Ingen verifisert referansepris lagt inn.",
    pendingReason: "Festemidler prises etter valgt kledning og innfesting."
  }),
  defineMaterial({
    id: "wind_barrier_tape",
    name: "Vindsperreteip og tettemidler",
    category: "Vindsperre",
    unit: "m²",
    // TAPE_PRICE_PENDING
    referenceRetailPriceInclVat: null,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: "Ingen verifisert referansepris lagt inn.",
    pendingReason: "Teip og tettemidler prises etter valgt vindsperresystem."
  }),

  // ── VINDSPERRE ────────────────────────────────────────────────────
  defineMaterial({
    id: "wind_barrier",
    name: "Vindsperre",
    category: "Vindsperre",
    unit: "m²",
    referenceRetailPriceInclVat: 50,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),

  // ── ISOLASJON ─────────────────────────────────────────────────────
  defineMaterial({
    id: "insulation_100mm",
    name: "Isolasjon 100 mm",
    category: "Isolasjon",
    unit: "m²",
    referenceRetailPriceInclVat: 120,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),

  // ── PLATER ────────────────────────────────────────────────────────
  defineMaterial({
    id: "plasterboard_standard",
    name: "Gipsplate standard",
    category: "Plater",
    unit: "m²",
    referenceRetailPriceInclVat: 80,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),
  defineMaterial({
    id: "mdf_wall_panel",
    name: "Ferdig MDF veggplate",
    category: "Plater",
    unit: "m²",
    referenceRetailPriceInclVat: 350,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),

  // ── GULV ──────────────────────────────────────────────────────────
  defineMaterial({
    id: "laminate_standard",
    name: "Laminat standard",
    category: "Gulv",
    unit: "m²",
    referenceRetailPriceInclVat: 380,
    wasteFactor: 0.08,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),
  defineMaterial({
    id: "standard_underlay",
    name: "Undergulv / standard underlag",
    category: "Gulvunderlag",
    unit: "m²",
    // UNDERLAY_PRICE_PENDING
    referenceRetailPriceInclVat: null,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: "Ingen verifisert referansepris lagt inn.",
    pendingReason: "Underlag/trinnlyd beregnes etter valgt gulv og underlag."
  }),
  defineMaterial({
    id: "acoustic_underlay",
    name: "Trinnlydsmatte",
    category: "Gulvunderlag",
    unit: "m²",
    // UNDERLAY_PRICE_PENDING
    referenceRetailPriceInclVat: null,
    lastUpdated: PRICE_DATE,
    materialTier: "premium",
    sourceNotes: "Ingen verifisert referansepris lagt inn.",
    pendingReason: "Underlag/trinnlyd beregnes etter valgt gulv og underlag."
  }),
  defineMaterial({
    id: "trim_standard",
    name: "Listverk, standard",
    category: "Listverk",
    unit: "lm",
    // TRIM_PRICE_PENDING
    referenceRetailPriceInclVat: null,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: "Ingen verifisert referansepris lagt inn.",
    pendingReason: "Materialpris avhenger av valgt list."
  }),
  defineMaterial({
    id: "oak_parquet_standard",
    name: "Eikeparkett standard",
    category: "Gulv",
    unit: "m²",
    referenceRetailPriceInclVat: 900,
    wasteFactor: 0.08,
    lastUpdated: PRICE_DATE,
    materialTier: "premium",
    sourceNotes: RETAIL_SOURCE
  })
];

export const MATERIALS: Record<string, Material> = Object.fromEntries(
  MATERIAL_LIST.map((m) => [m.id, m])
);

export const MATERIAL_IDS = MATERIAL_LIST.map((m) => m.id);

export function getMaterial(id: string): Material | undefined {
  return MATERIALS[id];
}

/** Nyeste `lastUpdated` i databasen — vises som "priser per <dato>". */
export const MATERIALS_LAST_UPDATED = MATERIAL_LIST.reduce(
  (latest, m) => (m.lastUpdated > latest ? m.lastUpdated : latest),
  MATERIAL_LIST[0]?.lastUpdated ?? PRICE_DATE
);
