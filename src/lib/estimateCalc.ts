/**
 * Bindeledd mellom Prisestimat-UI-et og prismotoren i `src/lib/pricing`.
 *
 * Forretningslogikken ligger IKKE her — den ligger i konfigurasjonen
 * (`src/config/pricing`) og i de to motorene (arbeid og materialer).
 * Denne fila oversetter bare mellom radene i skjemaet og motoren, og
 * holder på eldre rader som fortsatt prises med kr/enhet.
 */

import type { PriceUnit } from "@/data/pricing";
import {
  pricingSettings,
  laborHoursForItem,
  getRecipe,
  availableTiers,
  type DifficultyKey,
  type MaterialTier,
  type TerraceConstructionKey
} from "@/config/pricing";
import {
  calcLaborLine,
  calcMaterialLine,
  calculateEstimate,
  formatNok as formatNokBase,
  roundForDisplay,
  type EstimateResult,
  type MaterialLine
} from "@/lib/pricing";

export type EstimateRow = {
  id: number | string;
  name: string;
  unit: PriceUnit | string;
  qty: string | number;
  /** Eldre fast enhetspris. Ignoreres når `workItemKey` er satt. */
  price: string | number;
  note?: string;
  matched?: boolean;
  matchName?: string;
  /** Satt når raden prises via arbeidstime-motoren. */
  workItemKey?: string;
  /** Egen materialoppskrift når posten avviker fra arbeidspostens. */
  materialRecipeKey?: string;
  difficulty?: DifficultyKey;
  /** Kun relevant for terrasseposter. */
  terraceConstruction?: TerraceConstructionKey;
};

export type EstimateInput = {
  projectName: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerPostal?: string;
  message?: string;
  rows: EstimateRow[];
  mvaRate: number;
  /** Eldre påslag — alltid 0 under arbeids-/materialmotoren. */
  markup: number;
  /** Kundens valg: kun arbeid, standard eller premium materialer. */
  materialTier?: MaterialTier;
};

export type EstimateTotals = {
  /** Arbeid + materialer + eldre rader, eks. mva. */
  subtotal: number;
  /** Reservert. Motoren bruker ikke påslag. */
  markupAmount: number;
  subWithMarkup: number;
  mvaAmount: number;
  /** Valgt scenario, inkl. mva. */
  total: number;

  laborHours: number;
  laborExVat: number;
  laborIncVat: number;

  materialTier: MaterialTier;
  materialExVat: number;
  materialIncVat: number;
  materialWasteExVat: number;
  materialProtectionExVat: number;
  /** True når materialsummen er et gulv fordi noe bevisst er upriset. */
  materialIsFloor: boolean;

  /** Eldre rader uten arbeidsnøkkel. */
  legacyExVat: number;

  range: { low: number; high: number };
  /** Hele motorresultatet — alle tre scenariene. */
  estimate: EstimateResult;
};

/** Radene som faktisk går gjennom motoren. */
function engineLines(rows: EstimateRow[]) {
  return rows
    .filter(
      (r) => r.workItemKey && laborHoursForItem(String(r.workItemKey)) != null
    )
    .map((r) => ({
      workItemKey: String(r.workItemKey),
      materialRecipeKey: r.materialRecipeKey,
      label: r.matchName || r.name,
      unit: String(r.unit),
      quantity: r.qty,
      difficulty: r.difficulty
    }));
}

export function calcTotals(input: EstimateInput): EstimateTotals {
  const tier: MaterialTier = input.materialTier ?? "none";
  const estimate = calculateEstimate(engineLines(input.rows));

  // Faller tilbake til "kun arbeid" om valgt nivå ikke er tilgjengelig,
  // slik at vi aldri viser en materialpris vi ikke kan forsvare.
  const activeTier: MaterialTier = estimate.scenarios[tier].available
    ? tier
    : "none";
  const active = estimate.scenarios[activeTier];

  const legacyRows = input.rows.filter(
    (r) => !r.workItemKey || laborHoursForItem(String(r.workItemKey)) == null
  );
  const legacyExVat = legacyRows.reduce(
    (sum, r) =>
      sum + (parseFloat(String(r.qty)) || 0) * (parseFloat(String(r.price)) || 0),
    0
  );
  const legacyVat = legacyExVat * (input.mvaRate / 100);

  const subtotal = active.subtotalExVat + legacyExVat;
  const mvaAmount = active.vat + legacyVat;
  const total = subtotal + mvaAmount;

  const withVat = (n: number) => n * (1 + pricingSettings.vatRate);
  const range = {
    low: roundForDisplay(
      withVat(
        estimate.labor.totalLaborExVat * pricingSettings.estimateRange.low +
          active.materialExVat +
          legacyExVat
      )
    ),
    high: roundForDisplay(
      withVat(
        estimate.labor.totalLaborExVat * pricingSettings.estimateRange.high +
          active.materialExVat +
          legacyExVat
      )
    )
  };

  return {
    subtotal,
    markupAmount: 0,
    subWithMarkup: subtotal,
    mvaAmount,
    total,
    laborHours: estimate.labor.totalLaborHours,
    laborExVat: estimate.labor.totalLaborExVat,
    laborIncVat: estimate.labor.totalLaborIncVat,
    materialTier: activeTier,
    materialExVat: active.materialExVat,
    materialIncVat: active.materials.totalMaterialIncVat,
    materialWasteExVat: active.materials.totalWasteExVat,
    materialProtectionExVat: active.materials.totalProtectionExVat,
    materialIsFloor: active.isFloor,
    legacyExVat,
    range,
    estimate
  };
}

/** Arbeidslinjer for detaljert beregning i UI og PDF. */
export function laborLinesForRows(rows: EstimateRow[]) {
  return engineLines(rows).map(calcLaborLine);
}

/** Materiallinjer for detaljert beregning i UI og PDF. */
export function materialLinesForRows(
  rows: EstimateRow[],
  tier: MaterialTier
): MaterialLine[] {
  return engineLines(rows).map((l) => calcMaterialLine({ ...l, tier }));
}

/** Kan denne radsamlingen i det hele tatt tilby materialpriser? */
export function tiersForRows(rows: EstimateRow[]) {
  const keys = engineLines(rows).map(
    (l) => l.materialRecipeKey ?? l.workItemKey
  );
  return {
    standard: keys.some((k) => {
      const r = getRecipe(k);
      return r != null && r.status !== "pending" && r.status !== "none";
    }),
    premium: keys.some((k) => availableTiers(k).includes("premium"))
  };
}

/** Eldre hjelper — beholdt for bakoverkompatibilitet. */
export function estimateRange(total: number): { low: number; high: number } {
  return {
    low: roundForDisplay(total * pricingSettings.estimateRange.low),
    high: roundForDisplay(total * pricingSettings.estimateRange.high)
  };
}

export const formatNok = formatNokBase;

export const HOURLY_RATE_EX_VAT = pricingSettings.hourlyRateExVat;
export const VAT_RATE = pricingSettings.vatRate;
