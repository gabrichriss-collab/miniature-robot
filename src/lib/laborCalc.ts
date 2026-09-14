/**
 * Pure calculation functions for the labor-based pricing engine.
 *
 * All monetary values are treated as NOK. All rounding of DISPLAY values
 * happens elsewhere; these functions return exact numbers so callers can
 * sum them without accumulated rounding drift.
 */

import {
  DIFFICULTY_FACTORS,
  HOURLY_RATE_EX_VAT,
  VAT_RATE,
  WORK_ITEMS,
  type DifficultyKey,
  type WorkItemKey
} from "@/config/pricing";

/** A single line the customer has entered into the estimator. */
export type LaborLineInput = {
  /** Reference into WORK_ITEMS. Optional — legacy free-typed rows omit it. */
  workItemKey?: WorkItemKey | string;
  /** Rendered label used in totals and PDF. */
  label: string;
  /** m², lm, stk … */
  unit: string;
  /** How much of the unit the customer wants. Accepts number or a string
   *  from a form input; falsy / non-numeric values are treated as 0. */
  quantity: number | string;
  /** Overrides the value in WORK_ITEMS if supplied. */
  laborHoursPerUnit?: number;
  /** Optional per-line difficulty. Defaults to "normal". */
  difficulty?: DifficultyKey;
  /** Optional per-line hourly-rate override. Defaults to the global rate. */
  hourlyRateExVat?: number;
};

export type LaborLine = {
  workItemKey?: string;
  label: string;
  unit: string;
  quantity: number;
  laborHoursPerUnit: number;
  difficulty: DifficultyKey;
  difficultyFactor: number;
  hourlyRateExVat: number;
  /** quantity × laborHoursPerUnit × difficultyFactor. */
  totalLaborHours: number;
  /** totalLaborHours × hourlyRate. */
  laborPriceExVat: number;
  /** laborPriceExVat × VAT_RATE. */
  vat: number;
  /** laborPriceExVat + vat. */
  laborPriceIncVat: number;
};

export type LaborTotal = {
  lines: LaborLine[];
  totalLaborHours: number;
  totalLaborExVat: number;
  totalVat: number;
  totalLaborIncVat: number;
};

/** Robust number parsing: strings, empty values, NaN and negatives all → 0. */
export function toQty(x: number | string | undefined | null): number {
  if (x == null) return 0;
  const n = typeof x === "number" ? x : parseFloat(String(x).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/**
 * Look up the labor-hours factor for a work item. Returns `undefined` if the
 * key is unknown, so callers can treat it as a legacy row.
 */
export function laborHoursForItem(key: string): number | undefined {
  return (WORK_ITEMS as Record<string, { laborHoursPerUnit: number }>)[key]
    ?.laborHoursPerUnit;
}

/** Round to the nearest whole øre for internal totals. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Compute all derived values for one estimator line. Returns zeroed values
 * if the row can't be priced (missing quantity, unknown work item, etc.) —
 * never throws.
 */
export function calcLaborLine(input: LaborLineInput): LaborLine {
  const quantity = toQty(input.quantity);
  const difficulty: DifficultyKey = input.difficulty ?? "normal";
  const difficultyFactor = DIFFICULTY_FACTORS[difficulty] ?? 1;
  const hourlyRateExVat =
    typeof input.hourlyRateExVat === "number" && input.hourlyRateExVat > 0
      ? input.hourlyRateExVat
      : HOURLY_RATE_EX_VAT;

  const catalogHours = input.workItemKey
    ? laborHoursForItem(String(input.workItemKey))
    : undefined;
  const laborHoursPerUnit =
    typeof input.laborHoursPerUnit === "number" && input.laborHoursPerUnit > 0
      ? input.laborHoursPerUnit
      : catalogHours ?? 0;

  const totalLaborHours = round2(quantity * laborHoursPerUnit * difficultyFactor);
  const laborPriceExVat = round2(totalLaborHours * hourlyRateExVat);
  const vat = round2(laborPriceExVat * VAT_RATE);
  const laborPriceIncVat = round2(laborPriceExVat + vat);

  return {
    workItemKey: input.workItemKey ? String(input.workItemKey) : undefined,
    label: input.label,
    unit: input.unit,
    quantity,
    laborHoursPerUnit,
    difficulty,
    difficultyFactor,
    hourlyRateExVat,
    totalLaborHours,
    laborPriceExVat,
    vat,
    laborPriceIncVat
  };
}

/** Sum all lines into a single total. */
export function calcLaborTotal(inputs: LaborLineInput[]): LaborTotal {
  const lines = inputs.map(calcLaborLine);
  const totalLaborHours = round2(
    lines.reduce((s, l) => s + l.totalLaborHours, 0)
  );
  const totalLaborExVat = round2(
    lines.reduce((s, l) => s + l.laborPriceExVat, 0)
  );
  const totalVat = round2(lines.reduce((s, l) => s + l.vat, 0));
  const totalLaborIncVat = round2(totalLaborExVat + totalVat);

  return {
    lines,
    totalLaborHours,
    totalLaborExVat,
    totalVat,
    totalLaborIncVat
  };
}

/**
 * Turn a point estimate into a low/high range for the customer-facing card.
 * ±10 % low, +15 % high (asymmetric — most jobs land above rather than
 * below the paper estimate). Rounded to nearest 500 kr.
 */
export function estimateRangeAroundPoint(point: number): {
  low: number;
  high: number;
} {
  const low = Math.round((point * 0.9) / 500) * 500;
  const high = Math.round((point * 1.15) / 500) * 500;
  return { low, high };
}

/** Norsk tallformat, "1 234 567". */
export function formatNok(n: number): string {
  return Number(n).toLocaleString("nb-NO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/** Norsk desimalformat med 1 desimal — brukes for timer. */
export function formatHours(n: number): string {
  return Number(n).toLocaleString("nb-NO", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1
  });
}
