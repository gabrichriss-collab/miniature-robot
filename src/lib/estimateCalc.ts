import type { PriceUnit } from "@/data/pricing";

export type EstimateRow = {
  id: number | string;
  name: string;
  unit: PriceUnit | string;
  qty: string | number;
  price: string | number;
  note?: string;
  matched?: boolean;
  matchName?: string;
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
  markup: number;
};

export type EstimateTotals = {
  subtotal: number;
  markupAmount: number;
  subWithMarkup: number;
  mvaAmount: number;
  total: number;
};

export function calcTotals(input: EstimateInput): EstimateTotals {
  const subtotal = input.rows.reduce(
    (sum, r) =>
      sum + (parseFloat(String(r.qty)) || 0) * (parseFloat(String(r.price)) || 0),
    0
  );
  const markupAmount = subtotal * (input.markup / 100);
  const subWithMarkup = subtotal + markupAmount;
  const mvaAmount = subWithMarkup * (input.mvaRate / 100);
  const total = subWithMarkup + mvaAmount;

  return { subtotal, markupAmount, subWithMarkup, mvaAmount, total };
}

/**
 * Turn a single point estimate into a low/high range that the customer sees
 * as "Veiledende prisestimat". ±15 % is a defensible spread for line-item
 * carpentry work where the tender still needs a site visit.
 */
export function estimateRange(total: number): { low: number; high: number } {
  const spread = 0.15;
  return {
    low: Math.round((total * (1 - spread)) / 1000) * 1000,
    high: Math.round((total * (1 + spread)) / 1000) * 1000
  };
}

/** Norsk tallformat, "1 234 567". */
export function formatNok(n: number): string {
  return Number(n).toLocaleString("nb-NO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
