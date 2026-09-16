/**
 * ARBEIDSMOTOREN.
 *
 *   arbeidstimer = mengde × timer per enhet × vanskelighetsfaktor
 *   arbeidspris  = arbeidstimer × timerate eks. mva
 *
 * Mva legges på FØRST etter at eks. mva-summene er ferdig regnet.
 * Funksjonene her er rene og kaster aldri — ugyldig input gir 0.
 */

import {
  DIFFICULTY_FACTORS,
  pricingSettings,
  type DifficultyKey
} from "../../config/pricing/settings";
import { laborHoursForItem } from "../../config/pricing/labor";

export type LaborLineInput = {
  /** Referanse inn i WORK_ITEMS. Utelates for eldre fritekstrader. */
  workItemKey?: string;
  label: string;
  unit: string;
  /** Tall eller streng fra et skjemafelt. Ugyldige verdier blir 0. */
  quantity: number | string;
  /** Overstyrer timetallet fra WORK_ITEMS. */
  laborHoursPerUnit?: number;
  difficulty?: DifficultyKey;
  /** Overstyrer den globale timeraten. */
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
  /** mengde × timer per enhet (før vanskelighet). */
  baseLaborHours: number;
  /** baseLaborHours × vanskelighetsfaktor. */
  totalLaborHours: number;
  laborPriceExVat: number;
  vat: number;
  laborPriceIncVat: number;
};

export type LaborTotal = {
  lines: LaborLine[];
  totalLaborHours: number;
  totalLaborExVat: number;
  totalVat: number;
  totalLaborIncVat: number;
};

/** Robust tallparsing: strenger, tomt, NaN og negative verdier blir 0. */
export function toQty(x: number | string | undefined | null): number {
  if (x == null) return 0;
  const n = typeof x === "number" ? x : parseFloat(String(x).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/** Avrund til nærmeste øre for interne summer. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcLaborLine(input: LaborLineInput): LaborLine {
  const quantity = toQty(input.quantity);
  const difficulty: DifficultyKey = input.difficulty ?? "normal";
  const difficultyFactor = DIFFICULTY_FACTORS[difficulty] ?? 1;
  const hourlyRateExVat =
    typeof input.hourlyRateExVat === "number" && input.hourlyRateExVat > 0
      ? input.hourlyRateExVat
      : pricingSettings.hourlyRateExVat;

  const catalogHours = input.workItemKey
    ? laborHoursForItem(String(input.workItemKey))
    : undefined;
  const laborHoursPerUnit =
    typeof input.laborHoursPerUnit === "number" && input.laborHoursPerUnit > 0
      ? input.laborHoursPerUnit
      : catalogHours ?? 0;

  const baseLaborHours = round2(quantity * laborHoursPerUnit);
  const totalLaborHours = round2(quantity * laborHoursPerUnit * difficultyFactor);
  const laborPriceExVat = round2(totalLaborHours * hourlyRateExVat);
  const vat = round2(laborPriceExVat * pricingSettings.vatRate);
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
    baseLaborHours,
    totalLaborHours,
    laborPriceExVat,
    vat,
    laborPriceIncVat
  };
}

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

  return { lines, totalLaborHours, totalLaborExVat, totalVat, totalLaborIncVat };
}
