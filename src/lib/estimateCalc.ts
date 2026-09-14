import type { PriceUnit } from "@/data/pricing";
import {
  HOURLY_RATE_EX_VAT,
  VAT_RATE,
  type DifficultyKey
} from "@/config/pricing";
import {
  calcLaborLine,
  calcLaborTotal,
  estimateRangeAroundPoint,
  laborHoursForItem,
  formatNok as formatNokLabor
} from "@/lib/laborCalc";

export type EstimateRow = {
  id: number | string;
  name: string;
  unit: PriceUnit | string;
  qty: string | number;
  /** Legacy fixed unit price. Ignored when `workItemKey` is set. */
  price: string | number;
  note?: string;
  matched?: boolean;
  matchName?: string;
  /** Set when the row is priced via the labor engine. */
  workItemKey?: string;
  /** Per-row difficulty. Defaults to "normal". */
  difficulty?: DifficultyKey;
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
  /** Legacy påslag — kept for backwards compatibility, always 0 under the labor engine. */
  markup: number;
};

export type EstimateTotals = {
  /** Sum of labor-engine + legacy row prices, ex VAT. */
  subtotal: number;
  /** Reserved. The labor engine keeps materials separate, so this is 0. */
  markupAmount: number;
  subWithMarkup: number;
  mvaAmount: number;
  total: number;
  /** Sub-breakdown from the labor engine. */
  laborHours: number;
  laborExVat: number;
  laborIncVat: number;
  /** Sub-breakdown from legacy rows (no work item key). */
  legacyExVat: number;
  /** Low/high range around `total` — nearest 500 kr. */
  range: { low: number; high: number };
};

export function calcTotals(input: EstimateInput): EstimateTotals {
  // Split rows: labor-engine rows vs legacy free-typed rows.
  const laborInputs = input.rows
    .filter((r) => r.workItemKey && laborHoursForItem(String(r.workItemKey)) != null)
    .map((r) => ({
      workItemKey: r.workItemKey,
      label: r.matchName || r.name,
      unit: String(r.unit),
      quantity: r.qty,
      difficulty: r.difficulty
    }));

  const legacyRows = input.rows.filter(
    (r) => !r.workItemKey || laborHoursForItem(String(r.workItemKey)) == null
  );

  const labor = calcLaborTotal(laborInputs);

  const legacyExVat = legacyRows.reduce(
    (sum, r) =>
      sum + (parseFloat(String(r.qty)) || 0) * (parseFloat(String(r.price)) || 0),
    0
  );
  const legacyVat = legacyExVat * (input.mvaRate / 100);

  const subtotal = labor.totalLaborExVat + legacyExVat;
  const mvaAmount = labor.totalVat + legacyVat;
  const total = subtotal + mvaAmount;

  return {
    subtotal,
    markupAmount: 0,
    subWithMarkup: subtotal,
    mvaAmount,
    total,
    laborHours: labor.totalLaborHours,
    laborExVat: labor.totalLaborExVat,
    laborIncVat: labor.totalLaborIncVat,
    legacyExVat,
    range: estimateRangeAroundPoint(total)
  };
}

/**
 * Deprecated wrapper — prefer `EstimateTotals.range`. Kept so any external
 * callers (PDF, tests) don't break.
 */
export function estimateRange(total: number): { low: number; high: number } {
  return estimateRangeAroundPoint(total);
}

/** Norsk tallformat, "1 234 567". Re-eksportert fra labor-modulen. */
export const formatNok = formatNokLabor;

/** Re-eksporter for komponenter som fortsatt importerer disse via estimateCalc. */
export { HOURLY_RATE_EX_VAT, VAT_RATE };

/** Publiser labor-linjer for debug/detaljert breakdown i UI. */
export function laborLinesForRows(rows: EstimateRow[]) {
  return rows
    .filter((r) => r.workItemKey && laborHoursForItem(String(r.workItemKey)) != null)
    .map((r) =>
      calcLaborLine({
        workItemKey: r.workItemKey,
        label: r.matchName || r.name,
        unit: String(r.unit),
        quantity: r.qty,
        difficulty: r.difficulty
      })
    );
}
