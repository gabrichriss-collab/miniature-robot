/**
 * Rene visningsfunksjoner. Denne fila kjoerer i nettleseren, saa den
 * importerer bevisst INGENTING fra `src/server/pricing` — der ligger
 * forretningstallene.
 */

/** Avrundingstrinn for kundevendte summer. Visningskonvensjon, ikke pris. */
export const DISPLAY_ROUNDING_NOK = 500;

/** Norsk tallformat, "1 234 567". */
export function formatNok(n: number): string {
  return Number(n).toLocaleString("nb-NO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/** Norsk desimalformat med inntil 1 desimal — brukes for timer. */
export function formatHours(n: number): string {
  return Number(n).toLocaleString("nb-NO", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1
  });
}

/** Mengder: inntil 1 desimal, uten falsk presisjon. */
export function formatQty(n: number): string {
  return Number(n).toLocaleString("nb-NO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });
}

/**
 * Kundevendte summer avrundes til nærmeste 500 kr. Vi viser aldri
 * "68 972 kr" på et estimat — det er falsk presisjon.
 */
export function roundForDisplay(
  n: number,
  step: number = DISPLAY_ROUNDING_NOK
): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / step) * step;
}
