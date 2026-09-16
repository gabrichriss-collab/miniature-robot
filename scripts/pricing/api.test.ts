/**
 * SIKKERHETSREGRESJON.
 *
 * Disse testene passer paa grensen mellom motoren og kunden. Faller en
 * av dem, har vi begynt aa lekke forretningsmodellen ut i svaret.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { buildPublicCatalogue } from "../../src/server/pricing/catalogue";
import { toCustomerEstimate } from "../../src/server/pricing/toCustomerEstimate";
import type { EstimateRequestLine } from "../../src/lib/pricing/contract";
import type { EstimateLine } from "../../src/server/pricing/calculateEstimate";

/** Felter som ALDRI skal finnes noe sted i et svar til kunden. */
const FORBIDDEN_KEYS = [
  "hourlyRate",
  "hourlyRateExVat",
  "hoursPerUnit",
  "laborHoursPerUnit",
  "totalLaborHours",
  "baseLaborHours",
  "difficultyFactor",
  "wasteFactor",
  "protectionFactor",
  "referencePrice",
  "referencePriceExVat",
  "referenceRetailPriceInclVat",
  "recipe",
  "components",
  "consumptionFactor",
  "quantityPerUnit",
  "materialId",
  "grossQuantity",
  "netQuantity",
  "rawCostExVat",
  "wasteCostExVat",
  "protectionCostExVat",
  "smallConsumablesExVat",
  "assumption",
  "sourceNotes",
  "internalNote"
];

/** Gaar gjennom hele det serialiserte treet, ikke bare toppnivaaet. */
function collectKeys(value: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    value.forEach((v) => collectKeys(v, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      out.add(k);
      collectKeys(v, out);
    }
  }
  return out;
}

const terraceRequest: EstimateRequestLine[] = [
  {
    id: "r1",
    catalogueId: "Bygging av terrasse (standard)",
    quantity: 36,
    unit: "m²",
    difficulty: "normal",
    terraceConstruction: "standard",
    terraceFastening: "visible",
    terraceFoundation: "existing"
  }
];

const terraceEngine: Array<EstimateLine & { requestId: string }> = [
  {
    requestId: "r1",
    workItemKey: "terraceComplete",
    label: "Bygging av terrasse (standard)",
    unit: "m²",
    quantity: 36,
    difficulty: "normal",
    options: {
      terraceConstruction: "standard",
      terraceFastening: "visible",
      terraceFoundation: "existing"
    }
  }
];

test("SIKKERHET: svaret inneholder ingen private felter", () => {
  for (const tier of ["none", "standard", "premium"] as const) {
    const dto = toCustomerEstimate(terraceRequest, terraceEngine, tier);
    const keys = collectKeys(JSON.parse(JSON.stringify(dto)));
    for (const forbidden of FORBIDDEN_KEYS) {
      assert.ok(
        !keys.has(forbidden),
        `"${forbidden}" lekket ut i svaret (nivå ${tier})`
      );
    }
  }
});

test("SIKKERHET: svaret avsloerer ikke timerate eller timeforbruk", () => {
  const dto = toCustomerEstimate(terraceRequest, terraceEngine, "standard");
  const json = JSON.stringify(dto);
  // 57,6 timer og 1,6 t/m2 skal ikke staa noe sted.
  assert.ok(!json.includes("57.6"), "totalt timeforbruk lekket");
  assert.ok(!json.includes("1.6"), "produktivitetskoeffisient lekket");
  // Selve timeraten skal heller ikke staa som eget tall.
  assert.ok(!/[:,]850[,}]/.test(json), "timeraten lekket");
});

test("SIKKERHET: katalogen til nettleseren er vasket", () => {
  const cat = buildPublicCatalogue();
  assert.ok(cat.length > 0);
  const keys = collectKeys(JSON.parse(JSON.stringify(cat)));
  for (const forbidden of [...FORBIDDEN_KEYS, "price", "workItemKey"]) {
    assert.ok(!keys.has(forbidden), `"${forbidden}" lekket ut i katalogen`);
  }
  // Den skal inneholde akkurat de feltene UI trenger — ikke flere.
  assert.deepEqual(
    Object.keys(cat[0]).sort(),
    [
      "category",
      "hasPremium",
      "id",
      "keywords",
      "name",
      "note",
      "optionGroups",
      "priceable",
      "unit"
    ].sort()
  );
});

test("SIKKERHET: 36 m2 terrasse gir samme tall som foer flyttingen", () => {
  const dto = toCustomerEstimate(terraceRequest, terraceEngine, "standard");
  // Arbeid: 36 x 1,60 x 850 = 48 960 — uendret.
  assert.equal(dto.scenarios.none.laborExVat, 48960);
  assert.equal(dto.scenarios.none.totalIncVat, 61200);
  // Standard materialer: uendret sum fra foer refaktoreringen.
  assert.equal(dto.scenarios.standard.materialExVat, 12431);
  assert.equal(dto.scenarios.standard.subtotalExVat, 61391);
  assert.equal(dto.scenarios.standard.totalIncVat, 76739);
  // Regnestykket kunden ser skal gaa opp med avrundede tall.
  const sc = dto.scenarios.standard;
  assert.equal(sc.laborExVat + sc.materialExVat, sc.subtotalExVat);
  assert.equal(sc.subtotalExVat + sc.vat, sc.totalIncVat);
  for (const v of [sc.laborExVat, sc.materialExVat, sc.subtotalExVat, sc.vat, sc.totalIncVat]) {
    assert.equal(v, Math.round(v), "kundevendt beloep skal vaere hele kroner");
  }
  // Linja viser pris, ikke oppskrift.
  assert.equal(dto.lines[0].laborExVat, 48960);
  assert.equal(dto.lines[0].quantity, 36);
  assert.equal(dto.lines[0].unit, "m²");
});

test("SIKKERHET: ufullstendig materialkurv markeres, men lekker ikke hvorfor", () => {
  const line: Array<EstimateLine & { requestId: string }> = [
    {
      requestId: "r1",
      workItemKey: "flooringInstallation",
      label: "Montering gulv",
      unit: "m²",
      quantity: 30,
      options: {}
    }
  ];
  const dto = toCustomerEstimate(
    [{ id: "r1", quantity: 30, unit: "m²" }],
    line,
    "standard"
  );
  assert.equal(dto.scenarios.standard.materialEstimateComplete, false);
  assert.equal(dto.lines[0].materialComplete, false);
  // Kunden faar NAVNET paa det som mangler ...
  assert.ok(dto.lines[0].notIncluded.length > 0);
  // ... men ikke mengden eller prisen bak det.
  const keys = collectKeys(JSON.parse(JSON.stringify(dto.lines[0])));
  assert.ok(!keys.has("quantityPerUnit"));
  assert.ok(!keys.has("materialId"));
});

test("SIKKERHET: kun arbeid gir null materialkostnad i svaret", () => {
  const dto = toCustomerEstimate(terraceRequest, terraceEngine, "none");
  assert.equal(dto.selectedTier, "none");
  assert.equal(dto.lines[0].materialExVat, 0);
  assert.equal(dto.scenarios.none.materialExVat, 0);
});

test("SIKKERHET: valgte alternativer returneres som klartekst, ikke faktorer", () => {
  const dto = toCustomerEstimate(
    [
      {
        ...terraceRequest[0],
        difficulty: "difficult",
        terraceFastening: "hidden"
      }
    ],
    [
      {
        ...terraceEngine[0],
        difficulty: "difficult",
        options: { ...terraceEngine[0].options, terraceFastening: "hidden" }
      }
    ],
    "standard"
  );
  const opts = dto.lines[0].chosenOptions;
  assert.ok(opts.some((o) => /Krevende tilkomst/.test(o)));
  assert.ok(opts.some((o) => /Skjult innfesting/.test(o)));
  // Ingen tallmultiplikatorer i klartekst.
  assert.ok(!opts.some((o) => /1\.15|1,15|1\.3\b/.test(o)));
});
