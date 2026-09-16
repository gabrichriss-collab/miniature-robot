/**
 * Tester prismotoren slik den faktisk er implementert — ikke en kopi av
 * formlene. Kjøres mot kompilert TypeScript, så konfig, oppskrifter og
 * beregning testes sammen.
 *
 *   npm test
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { pricingSettings, MATERIAL_TIER_LABELS } from "../../src/config/pricing/settings";
import { WORK_ITEMS } from "../../src/config/pricing/labor";
import { MATERIALS, getMaterial } from "../../src/config/pricing/materials";
import {
  MATERIAL_RECIPES,
  STRUCTURAL_ASSUMPTIONS,
  availableTiers,
  pendingMaterialDecisions,
  RECIPE_VARIANTS
} from "../../src/config/pricing/recipes";
import { calcLaborLine, calcLaborTotal, toQty } from "../../src/lib/pricing/calculateLabor";
import {
  calcMaterialLine,
  calcMaterialTotal
} from "../../src/lib/pricing/calculateMaterials";
import { calculateEstimate } from "../../src/lib/pricing/calculateEstimate";
import { findBestMatch } from "../../src/lib/fuzzyMatch";
import { PRICE_DB } from "../../src/data/pricing";
import { roundForDisplay } from "../../src/lib/pricing/format";

const near = (actual: number, expected: number, tol = 0.02) =>
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `forventet ~${expected}, fikk ${actual}`
  );

/* ══════════════════ GLOBALE INNSTILLINGER ══════════════════ */

test("timeraten finnes kun ett sted og er 850 kr eks. mva", () => {
  assert.equal(pricingSettings.hourlyRateExVat, 850);
  assert.equal(pricingSettings.vatRate, 0.25);
  assert.equal(pricingSettings.defaultMaterialWaste, 0.1);
  assert.equal(pricingSettings.defaultMaterialProtection, 0.1);
});

test("endring av timeraten slår gjennom i arbeidsprisen", () => {
  const base = calcLaborLine({
    workItemKey: "terraceComplete",
    label: "Terrasse",
    unit: "m²",
    quantity: 36
  });
  const bumped = calcLaborLine({
    workItemKey: "terraceComplete",
    label: "Terrasse",
    unit: "m²",
    quantity: 36,
    hourlyRateExVat: 950
  });
  assert.equal(base.laborPriceExVat, 57.6 * 850);
  assert.equal(bumped.laborPriceExVat, 57.6 * 950);
});

/* ══════════════════ ARBEIDSMOTOREN ══════════════════ */

test("ARBEID: 36 m² terrasse × 1,60 t/m² × 850 kr → 57,6 t / 48 960 kr / 61 200 kr", () => {
  const l = calcLaborLine({
    workItemKey: "terraceComplete",
    label: "Komplett terrasse",
    unit: "m²",
    quantity: 36
  });
  assert.equal(l.laborHoursPerUnit, 1.6);
  assert.equal(l.totalLaborHours, 57.6);
  assert.equal(l.laborPriceExVat, 48960);
  assert.equal(l.vat, 12240);
  assert.equal(l.laborPriceIncVat, 61200);
});

test("ARBEID: vanskelighetsgrad gjelder kun timer", () => {
  const normal = calcLaborLine({
    workItemKey: "terraceComplete", label: "T", unit: "m²", quantity: 36
  });
  const hard = calcLaborLine({
    workItemKey: "terraceComplete", label: "T", unit: "m²", quantity: 36,
    difficulty: "difficult"
  });
  const veryHard = calcLaborLine({
    workItemKey: "terraceComplete", label: "T", unit: "m²", quantity: 36,
    difficulty: "veryDifficult"
  });
  assert.equal(normal.difficultyFactor, 1);
  near(hard.totalLaborHours, 57.6 * 1.15);
  near(veryHard.totalLaborHours, 57.6 * 1.3);
  assert.equal(hard.baseLaborHours, 57.6);
});

test("ARBEID: null, negativ og ugyldig mengde gir 0 — aldri negativ pris", () => {
  assert.equal(toQty(0), 0);
  assert.equal(toQty(-5), 0);
  assert.equal(toQty("abc"), 0);
  assert.equal(toQty(""), 0);
  assert.equal(toQty("12,5"), 12.5);
  for (const q of [0, -10, "abc", "", null, undefined] as const) {
    const l = calcLaborLine({
      workItemKey: "terraceComplete", label: "T", unit: "m²", quantity: q as never
    });
    assert.equal(l.laborPriceExVat, 0);
    assert.ok(l.laborPriceExVat >= 0);
  }
});

test("ARBEID: desimalmengde og mva avrundes til øre", () => {
  const l = calcLaborLine({
    workItemKey: "windowReplacement", label: "Vindu", unit: "stk", quantity: 2
  });
  assert.equal(l.totalLaborHours, 11);
  assert.equal(l.laborPriceExVat, 9350);
  assert.equal(l.laborPriceIncVat, 11687.5);

  const d = calcLaborLine({
    workItemKey: "trimInstallation", label: "Listing", unit: "lm", quantity: 12.5
  });
  assert.equal(d.totalLaborHours, 1.5);
  assert.equal(d.laborPriceExVat, 1275);
});

test("ARBEID: ukjent arbeidspost gir 0 timer i stedet for å kaste", () => {
  const l = calcLaborLine({
    workItemKey: "finnesIkke", label: "Tull", unit: "m²", quantity: 10
  });
  assert.equal(l.laborHoursPerUnit, 0);
  assert.equal(l.laborPriceExVat, 0);
});

/* ══════════════════ MATERIALDATABASEN ══════════════════ */

test("MATERIAL: inkl. mva → eks. mva konverteres med 1,25", () => {
  const deck = getMaterial("decking_28x120_imp")!;
  assert.equal(deck.referenceRetailPriceInclVat, 21);
  near(deck.referencePriceExVat, 21 / 1.25); // 16,80
  near(deck.referencePriceExVat, 16.8);

  const royal = getMaterial("decking_28x120_royal")!;
  near(royal.referencePriceExVat, 34.4);

  const screws = getMaterial("terrace_screws_c4")!;
  near(screws.referencePriceExVat, 0.264, 0.0001);
});

test("MATERIAL: alle materialer har dato, kilde og svinn/buffer", () => {
  for (const m of Object.values(MATERIALS)) {
    assert.match(m.lastUpdated, /^\d{4}-\d{2}-\d{2}$/, `${m.id} mangler dato`);
    assert.ok(m.sourceNotes.length > 0, `${m.id} mangler sourceNotes`);
    assert.ok(m.wasteFactor >= 0 && m.wasteFactor < 1, `${m.id} svinn`);
    assert.ok(m.protectionFactor >= 0 && m.protectionFactor < 1, `${m.id} buffer`);
    assert.ok(m.referencePriceExVat > 0, `${m.id} pris`);
  }
});

test("MATERIAL: svinn og buffer er separate verdier, ikke ett påslag", () => {
  const line = calcMaterialLine({
    workItemKey: "plasterboardSingleLayer",
    label: "Gips", unit: "m²", quantity: 10, tier: "standard"
  });
  const c = line.components[0];
  // 10 m² netto → 11 m² brutto (10 % svinn) × 64 kr = 704 kr råkost
  assert.equal(c.netQuantity, 10);
  near(c.grossQuantity, 11);
  near(c.rawCostExVat, 704);
  near(c.wasteCostExVat, 64);        // svinnandelen alene
  near(c.protectionCostExVat, 70.4); // 10 % buffer på råkost
  near(c.totalCostExVat, 774.4);
  assert.notEqual(line.wasteExVat, line.protectionExVat);
});

/* ══════════════════ TERRASSEBORD — HOVEDTESTEN ══════════════════ */

test("TERRASSEBORD: 36 m² × 8,4 lm/m² = 302,4 lm før svinn", () => {
  assert.equal(STRUCTURAL_ASSUMPTIONS.deckingLmPerM2, 8.4);
  const line = calcMaterialLine({
    workItemKey: "terraceDeckingOnly",
    label: "Terrassebord", unit: "m²", quantity: 36, tier: "standard"
  });
  const deck = line.components.find((c) => c.materialId === "decking_28x120_imp")!;
  assert.equal(deck.netQuantity, 302.4);
  near(deck.grossQuantity, 332.64);          // + 10 % svinn
  near(deck.referencePriceExVat, 16.8);      // 21 / 1,25
  near(deck.rawCostExVat, 332.64 * 16.8);    // 5 588,35
  near(deck.protectionCostExVat, 332.64 * 16.8 * 0.1);
  near(deck.totalCostExVat, 332.64 * 16.8 * 1.1); // 6 147,19
});

test("TERRASSEBORD: skruforbruk følger av bjelkeavstand og skruer per kryss", () => {
  // 8,4 lm bord per m², kryss over bjelke hver 0,6 m, 2 skruer per kryss.
  const perM2 = MATERIAL_RECIPES.terraceDeckingOnly.components.find(
    (c) => c.materialId === "terrace_screws_c4"
  )!.quantityPerUnit;
  assert.equal(perM2, 28);
  assert.equal(STRUCTURAL_ASSUMPTIONS.joistSpacingM, 0.6);
  assert.equal(STRUCTURAL_ASSUMPTIONS.deckScrewsPerCrossing, 2);
  const line = calcMaterialLine({
    workItemKey: "terraceDeckingOnly",
    label: "Terrassebord", unit: "m²", quantity: 36, tier: "standard"
  });
  const screws = line.components.find((c) => c.materialId === "terrace_screws_c4")!;
  assert.equal(screws.netQuantity, 1008);
  near(screws.grossQuantity, 1058.4); // 5 % svinn på festemidler
});

test("TERRASSEBORD: standard vs premium bytter kun bordet", () => {
  const std = calcMaterialLine({
    workItemKey: "terraceDeckingOnly", label: "T", unit: "m²", quantity: 36, tier: "standard"
  });
  const prem = calcMaterialLine({
    workItemKey: "terraceDeckingOnly", label: "T", unit: "m²", quantity: 36, tier: "premium"
  });
  assert.ok(std.components.some((c) => c.materialId === "decking_28x120_imp"));
  assert.ok(prem.components.some((c) => c.materialId === "decking_28x120_royal"));
  // Skruene er identiske i begge nivåene.
  const stdScrews = std.components.find((c) => c.materialId === "terrace_screws_c4")!;
  const premScrews = prem.components.find((c) => c.materialId === "terrace_screws_c4")!;
  assert.equal(stdScrews.totalCostExVat, premScrews.totalCostExVat);
  assert.ok(prem.materialExVat > std.materialExVat);
});

/* ══════════════════ MANGLENDE OPPSKRIFTER ══════════════════ */

test("MANGLER: vindu og dør får ingen oppdiktet materialpris", () => {
  for (const key of ["windowReplacement", "exteriorDoorReplacement"]) {
    const line = calcMaterialLine({
      workItemKey: key, label: key, unit: "stk", quantity: 3, tier: "standard"
    });
    assert.equal(line.status, "pending");
    assert.equal(line.materialExVat, 0);
    assert.match(String(line.customerNote), /Materialpris avklares etter størrelse/);
  }
});

test("MANGLER: tilbygg og rehabilitering prises kun som arbeid", () => {
  for (const key of ["extensionCarpentry", "rehabilitationLight", "rehabilitationHeavy"]) {
    const line = calcMaterialLine({
      workItemKey: key, label: key, unit: "m²", quantity: 40, tier: "premium"
    });
    assert.equal(line.status, "pending");
    assert.equal(line.materialExVat, 0);
  }
});

test("MANGLER: ukjent arbeidspost gir 0 kr materialer, ikke krasj", () => {
  const line = calcMaterialLine({
    workItemKey: "finnesIkke", label: "Tull", unit: "m²", quantity: 10, tier: "standard"
  });
  assert.equal(line.status, "pending");
  assert.equal(line.materialExVat, 0);
});

test("MANGLER: komplett terrasse er 'partial' og navngir det som ikke er med", () => {
  const recipe = MATERIAL_RECIPES.terraceComplete;
  assert.equal(recipe.status, "partial");
  const labels = (recipe.pending ?? []).map((p) => p.label);
  assert.ok(labels.some((l) => /Bjelkelag/.test(l)));
  assert.ok(labels.some((l) => /Fundamentering/.test(l)));

  const line = calcMaterialLine({
    workItemKey: "terraceComplete", label: "T", unit: "m²", quantity: 36, tier: "standard"
  });
  assert.equal(line.isFloor, true);
  assert.equal(line.pending.length, 2);
});

test("MANGLER: riving har status 'none' og null materialkostnad", () => {
  const line = calcMaterialLine({
    workItemKey: "terraceDemolition", label: "Riving", unit: "m²", quantity: 36, tier: "premium"
  });
  assert.equal(line.status, "none");
  assert.equal(line.materialExVat, 0);
});

test("OPPSKRIFTER: enheten matcher alltid arbeidspostens enhet", () => {
  for (const [key, recipe] of Object.entries(MATERIAL_RECIPES)) {
    const workKey = RECIPE_VARIANTS[key] ?? key;
    const work = (WORK_ITEMS as Record<string, { unit: string }>)[workKey];
    assert.ok(work, `oppskrift ${key} har ingen arbeidspost`);
    assert.equal(recipe.unit, work.unit, `enhet spriker for ${key}`);
  }
});

test("OPPSKRIFTER: alle materialId-er finnes i databasen", () => {
  for (const recipe of Object.values(MATERIAL_RECIPES)) {
    const all = [
      ...recipe.components,
      ...Object.values(recipe.tiers ?? {}).flat()
    ];
    for (const c of all) {
      assert.ok(getMaterial(c.materialId), `ukjent material ${c.materialId}`);
      assert.ok(c.quantityPerUnit > 0, `mengde mangler for ${c.materialId}`);
    }
  }
});

test("OPPSKRIFTER: premium finnes kun der det gir mening", () => {
  assert.deepEqual(availableTiers("terraceComplete"), ["standard", "premium"]);
  assert.deepEqual(availableTiers("flooringInstallation"), ["standard", "premium"]);
  assert.deepEqual(availableTiers("plasterboardSingleLayer"), []);
  assert.deepEqual(availableTiers("windowReplacement"), []);
});

test("OPPSKRIFTER: poster uten premium faller tilbake på standard, ikke 0", () => {
  const std = calcMaterialLine({
    workItemKey: "finishedWallPanel", label: "MDF", unit: "m²", quantity: 20, tier: "standard"
  });
  const prem = calcMaterialLine({
    workItemKey: "finishedWallPanel", label: "MDF", unit: "m²", quantity: 20, tier: "premium"
  });
  assert.ok(std.materialExVat > 0);
  assert.equal(prem.materialExVat, std.materialExVat);
});

/* ══════════════════ FLERE POSTER SAMMEN ══════════════════ */

const multiJob = [
  { workItemKey: "terraceComplete", label: "Komplett terrasse", unit: "m²", quantity: 36 },
  { workItemKey: "terraceRailing", label: "Rekkverk", unit: "lm", quantity: 12 },
  { workItemKey: "terraceDemolition", label: "Riving", unit: "m²", quantity: 36 }
];

test("FLERE POSTER: arbeidstimer summeres per post og totalt", () => {
  const t = calcLaborTotal(multiJob);
  assert.equal(t.lines[0].totalLaborHours, 57.6); // 36 × 1,60
  assert.equal(t.lines[1].totalLaborHours, 14.4); // 12 × 1,20
  assert.equal(t.lines[2].totalLaborHours, 12.6); // 36 × 0,35
  assert.equal(t.totalLaborHours, 84.6);
  assert.equal(t.totalLaborExVat, 84.6 * 850);
  assert.equal(t.totalVat, 84.6 * 850 * 0.25);
  assert.equal(t.totalLaborIncVat, 84.6 * 850 * 1.25);
});

test("FLERE POSTER: materialer summeres uavhengig av arbeid", () => {
  const m = calcMaterialTotal(multiJob.map((l) => ({ ...l, tier: "standard" as const })));
  // Kun terrassen bidrar: rekkverk er pending, riving er none.
  const terrace = calcMaterialLine({ ...multiJob[0], tier: "standard" });
  near(m.totalMaterialExVat, terrace.materialExVat);
  assert.ok(m.totalWasteExVat > 0);
  assert.ok(m.totalProtectionExVat > 0);
  assert.equal(m.unpriced.length, 1);
  assert.equal(m.unpriced[0].workItemKey, "terraceRailing");
  assert.equal(m.hasFloorLines, true);
});

test("FLERE POSTER: mva legges på først etter at eks. mva er summert", () => {
  const r = calculateEstimate(multiJob);
  const s = r.scenarios.standard;
  near(s.subtotalExVat, s.laborExVat + s.materialExVat);
  near(s.vat, s.subtotalExVat * 0.25);
  near(s.totalIncVat, s.subtotalExVat * 1.25);
  // Materialene er normalisert til eks. mva før de blandes med arbeid.
  assert.ok(s.materialExVat < s.materials.totalMaterialIncVat);
});

/* ══════════════════ SCENARIENE KUNDEN SER ══════════════════ */

const terrace36 = [
  { workItemKey: "terraceComplete", label: "Komplett terrasse", unit: "m²", quantity: 36 }
];

test("SCENARIER: 36 m² terrasse — kun arbeid er 48 960 / 61 200 kr", () => {
  const r = calculateEstimate(terrace36);
  const only = r.scenarios.none;
  assert.equal(only.laborExVat, 48960);
  assert.equal(only.materialExVat, 0);
  assert.equal(only.totalIncVat, 61200);
  assert.equal(MATERIAL_TIER_LABELS.none, "Kun arbeid");
});

test("SCENARIER: standard og premium legger materialer oppå samme arbeid", () => {
  const r = calculateEstimate(terrace36);
  const { none, standard, premium } = r.scenarios;
  assert.equal(standard.laborExVat, none.laborExVat);
  assert.equal(premium.laborExVat, none.laborExVat);
  assert.ok(standard.materialExVat > 0);
  assert.ok(premium.materialExVat > standard.materialExVat);
  assert.ok(premium.totalIncVat > standard.totalIncVat);
  assert.equal(r.materialsAvailable, true);
  assert.equal(r.premiumAvailable, true);
});

test("SCENARIER: premium skrus av når ingen post har et premium-nivå", () => {
  const r = calculateEstimate([
    { workItemKey: "plasterboardSingleLayer", label: "Gips", unit: "m²", quantity: 40 }
  ]);
  assert.equal(r.materialsAvailable, true);
  assert.equal(r.premiumAvailable, false);
  assert.equal(r.scenarios.premium.available, false);
});

test("SCENARIER: materialer skrus av helt når ingen post kan prises", () => {
  const r = calculateEstimate([
    { workItemKey: "windowReplacement", label: "Vindu", unit: "stk", quantity: 4 }
  ]);
  assert.equal(r.materialsAvailable, false);
  assert.equal(r.scenarios.standard.available, false);
  assert.equal(r.unpricedMaterials.length, 1);
});

test("SPENN: usikkerhet legges på arbeidet, materialene polstres ikke to ganger", () => {
  const r = calculateEstimate(terrace36);
  const s = r.scenarios.standard;
  const expLow = roundForDisplay((48960 * 0.9 + s.materialExVat) * 1.25);
  const expHigh = roundForDisplay((48960 * 1.15 + s.materialExVat) * 1.25);
  assert.equal(s.range.low, expLow);
  assert.equal(s.range.high, expHigh);
  assert.ok(s.range.low < s.totalIncVat);
  assert.ok(s.range.high > s.totalIncVat);
});

test("AVRUNDING: kundevendte summer rundes til nærmeste 500 kr", () => {
  assert.equal(roundForDisplay(68972), 69000);
  assert.equal(roundForDisplay(61200), 61000);
  assert.equal(roundForDisplay(0), 0);
  assert.equal(roundForDisplay(-100), 0);
  const r = calculateEstimate(terrace36);
  assert.equal(r.scenarios.standard.range.low % 500, 0);
  assert.equal(r.scenarios.standard.range.high % 500, 0);
});

test("TOM KALKYLE: ingen poster gir nuller hele veien", () => {
  const r = calculateEstimate([]);
  assert.equal(r.labor.totalLaborHours, 0);
  assert.equal(r.scenarios.none.totalIncVat, 0);
  assert.equal(r.materialsAvailable, false);
});

/* ══════════════════ ÅPNE BESLUTNINGER ══════════════════ */

test("Alle uferdige oppskrifter er flagget med intern begrunnelse", () => {
  const pending = pendingMaterialDecisions();
  assert.ok(pending.length > 0);
  for (const p of pending) {
    const recipe = MATERIAL_RECIPES[p.workItemKey];
    const explained =
      (recipe.pending ?? []).length > 0 ||
      recipe.internalNote != null ||
      recipe.customerNote != null;
    assert.ok(explained, `${p.workItemKey} er uferdig uten forklaring`);
  }
});

/* ══════════════════ KARTLEGGING AV EKSISTERENDE POSTER ══════════════════ */

test("KARTLEGGING: hver arbeidspost har en materialoppskrift", () => {
  for (const key of Object.keys(WORK_ITEMS)) {
    assert.ok(MATERIAL_RECIPES[key], `arbeidspost ${key} mangler oppskrift`);
  }
});

test("KARTLEGGING: alle prislisteposter peker på noe som finnes", () => {
  for (const e of PRICE_DB) {
    if (e.workItemKey) {
      assert.ok(
        (WORK_ITEMS as Record<string, unknown>)[e.workItemKey],
        `"${e.name}" peker på ukjent arbeidspost ${e.workItemKey}`
      );
    }
    if (e.materialRecipeKey) {
      assert.ok(
        MATERIAL_RECIPES[e.materialRecipeKey],
        `"${e.name}" peker på ukjent oppskrift ${e.materialRecipeKey}`
      );
    }
  }
});

test("KARTLEGGING: kartlagte poster har samme enhet som arbeidsposten", () => {
  for (const e of PRICE_DB) {
    if (!e.workItemKey) continue;
    const work = (WORK_ITEMS as Record<string, { unit: string }>)[e.workItemKey];
    assert.equal(e.unit, work.unit, `enhet spriker for "${e.name}"`);
  }
});

test("KARTLEGGING: terrassevarianter arver ikke standardterrassens materialer", () => {
  const hidden = PRICE_DB.find((e) => e.name === "Terrasse m/ skjult innfesting")!;
  const thermo = PRICE_DB.find((e) => e.name === "Terrasse m/ termofuru")!;
  // Samme arbeidstimer …
  assert.equal(hidden.workItemKey, "terraceComplete");
  assert.equal(thermo.workItemKey, "terraceComplete");
  // … men egne, foreløpig uprisede materialoppskrifter.
  assert.equal(hidden.materialRecipeKey, "terraceHiddenFastening");
  assert.equal(thermo.materialRecipeKey, "terraceThermowood");

  const line = calcMaterialLine({
    workItemKey: "terraceComplete",
    materialRecipeKey: "terraceThermowood",
    label: "Terrasse m/ termofuru",
    unit: "m²",
    quantity: 36,
    tier: "premium"
  });
  assert.equal(line.status, "pending");
  assert.equal(line.materialExVat, 0);

  // Arbeidet regnes likevel som en vanlig komplett terrasse.
  const r = calculateEstimate([
    {
      workItemKey: "terraceComplete",
      materialRecipeKey: "terraceThermowood",
      label: "Terrasse m/ termofuru",
      unit: "m²",
      quantity: 36
    }
  ]);
  assert.equal(r.scenarios.none.laborExVat, 48960);
  assert.equal(r.materialsAvailable, false);
});

/* ══════════════════ SØKEMATCHING ══════════════════ */

test("SØK: vanlige norske søk treffer riktig post", () => {
  const cases: Array<[string, string]> = [
    ["terrasse", "Bygging av terrasse (standard)"],
    ["ny terrasse", "Bygging av terrasse (standard)"],
    ["nytt vindu", "Montering vindu (standard)"],
    ["bytte vinduer", "Montering vindu (standard)"],
    ["ytterdør", "Montering ytterdør"],
    ["riving av terrasse", "Riving av terrasse"],
    ["termofuru", "Terrasse m/ termofuru"],
    ["skjult innfesting", "Terrasse m/ skjult innfesting"],
    ["listing", "Listing"],
    ["tilbygg", "Tilbygg — tømrerarbeid"],
    ["himling", "Himling"],
    ["montering gulv", "Montering gulv"]
  ];
  for (const [q, expected] of cases) {
    const m = findBestMatch(q);
    assert.equal(m?.name, expected, `"${q}" traff feil`);
  }
});

test("SØK: korte ord treffer ikke tilfeldige delstrenger", () => {
  // "ny" skal ikke treffe "vinyl", og "vindu" ikke "vindusrestaurering".
  assert.notEqual(findBestMatch("ny terrasse")?.name, "Vinylgulv");
  assert.notEqual(findBestMatch("vindu")?.name, "Restaurering av originalt vindu");
  assert.equal(findBestMatch(""), null);
  assert.equal(findBestMatch("x"), null);
  assert.equal(findBestMatch("qwerty zxcvb"), null);
});
