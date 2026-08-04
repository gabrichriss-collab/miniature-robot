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

/** Norsk tallformat, "1 234 567". */
export function formatNok(n: number): string {
  return Number(n).toLocaleString("nb-NO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
