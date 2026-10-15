import "server-only";

import {
  DIFFICULTY_ORDER,
  TERRACE_CONSTRUCTION_ORDER,
  TERRACE_FASTENING_ORDER,
  TERRACE_FOUNDATION_ORDER,
  CEILING_TYPE_ORDER,
  PARTITION_SCOPE_ORDER,
  INSULATION_OPTION_ORDER
} from "../../lib/pricing/public";

/** Felles grenser for /api/estimate og /api/prisestimat/pdf. */
export const MAX_LINES = 40;
export const MAX_QUANTITY = 100_000;

export const oneOf = <T extends string>(list: readonly T[], v: unknown): T | undefined =>
  typeof v === "string" && (list as readonly string[]).includes(v)
    ? (v as T)
    : undefined;

/** Avviser NaN, Infinity, negative og absurde mengder. */
export function parseQuantity(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0 || n > MAX_QUANTITY) return null;
  return n;
}

/**
 * Kundens valg for én post, sjekket mot listene over lovlige verdier.
 * Ukjente verdier blir undefined, ellers kan f.eks. "toString" slå opp en
 * funksjon i faktortabellen og gi NaN kr.
 */
export function readLineOptions(l: Record<string, unknown>) {
  return {
    difficulty: oneOf(DIFFICULTY_ORDER, l.difficulty),
    terraceConstruction: oneOf(TERRACE_CONSTRUCTION_ORDER, l.terraceConstruction),
    terraceFastening: oneOf(TERRACE_FASTENING_ORDER, l.terraceFastening),
    terraceFoundation: oneOf(TERRACE_FOUNDATION_ORDER, l.terraceFoundation),
    ceilingType: oneOf(CEILING_TYPE_ORDER, l.ceilingType),
    partitionScope: oneOf(PARTITION_SCOPE_ORDER, l.partitionScope),
    facadeInsulation: oneOf(INSULATION_OPTION_ORDER, l.facadeInsulation)
  };
}
