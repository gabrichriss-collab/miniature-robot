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
  | "Konstruksjonsvirke"
  | "Festemidler"
  | "Vindsperre"
  | "Isolasjon"
  | "Plater"
  | "Gulv";

/** Kvalitetsnivå materialet hører hjemme i. */
export type MaterialQuality = "standard" | "premium";

export type MaterialInput = {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  /** Veiledende utsalgspris inkl. mva, per `unit`. */
  referenceRetailPriceInclVat: number;
  /** Andel svinn (0.10 = 10 %). Faller tilbake på global standard. */
  wasteFactor?: number;
  /** Andel prisbuffer (0.10 = 10 %). Faller tilbake på global standard. */
  protectionFactor?: number;
  /** ISO-dato for når prisen sist ble kontrollert. */
  lastUpdated: string;
  materialTier: MaterialQuality;
  sourceNotes: string;
};

export type Material = Omit<MaterialInput, "wasteFactor" | "protectionFactor"> & {
  /** Avledet: referanseprisen normalisert til eks. mva. */
  referencePriceExVat: number;
  wasteFactor: number;
  protectionFactor: number;
};

/** Normaliserer til eks. mva og fyller inn globale standardverdier. */
function defineMaterial(m: MaterialInput): Material {
  const { wasteFactor, protectionFactor, ...rest } = m;
  return {
    ...rest,
    referencePriceExVat:
      m.referenceRetailPriceInclVat / (1 + pricingSettings.vatRate),
    wasteFactor: wasteFactor ?? pricingSettings.defaultMaterialWaste,
    protectionFactor:
      protectionFactor ?? pricingSettings.defaultMaterialProtection
  };
}

const RETAIL_SOURCE =
  "Konservativ norsk referansepris basert på flere byggevarekjeder, ikke kampanjepris.";

const PRICE_DATE = "2026-09-16";

const MATERIAL_LIST: Material[] = [
  // ── TERRASSEBORD ──────────────────────────────────────────────────
  defineMaterial({
    id: "decking_28x120_imp",
    name: "Terrassebord 28×120 trykkimpregnert",
    category: "Terrassebord",
    unit: "lm",
    referenceRetailPriceInclVat: 21,
    lastUpdated: PRICE_DATE,
    materialTier: "standard",
    sourceNotes: RETAIL_SOURCE
  }),
  defineMaterial({
    id: "decking_28x120_royal",
    name: "Terrassebord 28×120 Royal",
    category: "Terrassebord",
    unit: "lm",
    referenceRetailPriceInclVat: 43,
    lastUpdated: PRICE_DATE,
    materialTier: "premium",
    sourceNotes: RETAIL_SOURCE
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
