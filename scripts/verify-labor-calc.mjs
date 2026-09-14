// Standalone verification of the labor-based pricing engine's math.
// Duplicates the formulas from src/lib/laborCalc.ts so we're testing
// the SPEC, not the implementation — if the numbers here drift from
// what the implementation returns, one of the two is wrong.
//
// Run with:  node scripts/verify-labor-calc.mjs
//
// Every assertion is expressed in NOK ex VAT / inc VAT so any mismatch
// is trivial to reason about.

import { strict as assert } from "node:assert";
import { test } from "node:test";

const HOURLY_RATE_EX_VAT = 850;
const VAT_RATE = 0.25;
const DIFFICULTY_FACTORS = { normal: 1.0, difficult: 1.15, veryDifficult: 1.3 };

const round2 = (n) => Math.round(n * 100) / 100;

function calc({ quantity, hoursPerUnit, difficulty = "normal", rate = HOURLY_RATE_EX_VAT }) {
  const q = Number.isFinite(+quantity) && +quantity > 0 ? +quantity : 0;
  const factor = DIFFICULTY_FACTORS[difficulty] ?? 1;
  const hours = round2(q * hoursPerUnit * factor);
  const exVat = round2(hours * rate);
  const vat = round2(exVat * VAT_RATE);
  const incVat = round2(exVat + vat);
  return { hours, exVat, vat, incVat };
}

test("Terrasse — 36 m² × 1.60 h/m² → 57.6 h, 48 960 kr eks. mva", () => {
  const r = calc({ quantity: 36, hoursPerUnit: 1.6 });
  assert.equal(r.hours, 57.6);
  assert.equal(r.exVat, 48960);
  assert.equal(r.vat, 12240);
  assert.equal(r.incVat, 61200);
});

test("Vindu — 2 stk × 5.5 h/stk → 11 h, 9 350 kr eks. mva, 11 687.50 kr inkl. mva", () => {
  const r = calc({ quantity: 2, hoursPerUnit: 5.5 });
  assert.equal(r.hours, 11);
  assert.equal(r.exVat, 9350);
  assert.equal(r.vat, 2337.5);
  assert.equal(r.incVat, 11687.5);
});

test("Rekkverk — 12 lm × 1.20 h/lm → 14.4 h, 12 240 kr eks. mva, 15 300 kr inkl. mva", () => {
  const r = calc({ quantity: 12, hoursPerUnit: 1.2 });
  assert.equal(r.hours, 14.4);
  assert.equal(r.exVat, 12240);
  assert.equal(r.vat, 3060);
  assert.equal(r.incVat, 15300);
});

test("Nullmengde gir null", () => {
  const r = calc({ quantity: 0, hoursPerUnit: 1.6 });
  assert.equal(r.hours, 0);
  assert.equal(r.exVat, 0);
  assert.equal(r.vat, 0);
  assert.equal(r.incVat, 0);
});

test("Negativ mengde tolkes som null", () => {
  const r = calc({ quantity: -10, hoursPerUnit: 1.6 });
  assert.equal(r.hours, 0);
  assert.equal(r.exVat, 0);
});

test("Ugyldig mengde tolkes som null", () => {
  const r = calc({ quantity: "banan", hoursPerUnit: 1.6 });
  assert.equal(r.hours, 0);
  assert.equal(r.exVat, 0);
});

test("Desimaler: 12.5 m² × 0.35 h/m² → 4.375 → rundet 4.38 h", () => {
  const r = calc({ quantity: 12.5, hoursPerUnit: 0.35 });
  // 12.5 * 0.35 = 4.375, round2 → 4.38
  assert.equal(r.hours, 4.38);
  // 4.38 h × 850 = 3723 kr ex VAT
  assert.equal(r.exVat, 3723);
  assert.equal(r.vat, 930.75);
  assert.equal(r.incVat, 4653.75);
});

test("Difficulty krevende (×1.15): 36 m² × 1.60 × 1.15 → 66.24 h", () => {
  const r = calc({ quantity: 36, hoursPerUnit: 1.6, difficulty: "difficult" });
  assert.equal(r.hours, 66.24);
  assert.equal(r.exVat, 56304);
  assert.equal(r.vat, 14076);
  assert.equal(r.incVat, 70380);
});

test("Difficulty svært krevende (×1.30): 36 m² × 1.60 × 1.30 → 74.88 h", () => {
  const r = calc({ quantity: 36, hoursPerUnit: 1.6, difficulty: "veryDifficult" });
  assert.equal(r.hours, 74.88);
  assert.equal(r.exVat, 63648);
  assert.equal(r.vat, 15912);
  assert.equal(r.incVat, 79560);
});

test("Sum av flere poster: 57.6 + 14.4 + 12.6 = 84.6 h", () => {
  const terrasse = calc({ quantity: 36, hoursPerUnit: 1.6 });
  const rekkverk = calc({ quantity: 12, hoursPerUnit: 1.2 });
  const riving = calc({ quantity: 36, hoursPerUnit: 0.35 });
  const totalHours = round2(terrasse.hours + rekkverk.hours + riving.hours);
  assert.equal(totalHours, 84.6);
  const totalExVat = round2(terrasse.exVat + rekkverk.exVat + riving.exVat);
  assert.equal(totalExVat, 84.6 * 850);
});

test("MVA-avrunding: 3 723 × 0.25 = 930.75 kr eksakt", () => {
  const r = calc({ quantity: 12.5, hoursPerUnit: 0.35 });
  assert.equal(r.vat, 930.75);
});

test("Endring av timerate slår ut på alle poster", () => {
  const r1 = calc({ quantity: 10, hoursPerUnit: 1.0, rate: 850 });
  const r2 = calc({ quantity: 10, hoursPerUnit: 1.0, rate: 1000 });
  assert.equal(r1.exVat, 8500);
  assert.equal(r2.exVat, 10000);
});
