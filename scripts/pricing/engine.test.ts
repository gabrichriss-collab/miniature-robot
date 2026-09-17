/**
 * Tester prismotoren slik den faktisk er implementert — ikke en kopi av
 * formlene. Kjøres mot kompilert TypeScript, så konfig, oppskrifter og
 * beregning testes sammen.
 *
 *   npm test
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { pricingSettings, MATERIAL_TIER_LABELS } from "../../src/server/pricing/settings";
import { WORK_ITEMS } from "../../src/server/pricing/labor";
import { MATERIALS, getMaterial } from "../../src/server/pricing/materials";
import {
  MATERIAL_RECIPES,
  STRUCTURAL_ASSUMPTIONS,
  availableTiers,
  pendingMaterialDecisions,
  RECIPE_VARIANTS,
  TERRACE_CONSTRUCTIONS,
  TERRACE_STRUCTURAL_CAVEAT
} from "../../src/server/pricing/recipes";
import { calcLaborLine, calcLaborTotal, toQty } from "../../src/server/pricing/calculateLabor";
import {
  FASTENING_LABOR_FACTORS,
  resolveLaborHoursPerUnit,
  CEILING_TYPES,
  PARTITION_SCOPES,
  INSULATION_OPTIONS,
  INSULATION_OPTION_ORDER
} from "../../src/server/pricing/labor";
import {
  calcMaterialLine,
  calcMaterialTotal
} from "../../src/server/pricing/calculateMaterials";
import { calculateEstimate } from "../../src/server/pricing/calculateEstimate";
import { findBestMatch, wordMatches } from "../../src/lib/fuzzyMatch";
import { PRICE_DB } from "../../src/server/pricing/catalogue-source";
import { buildPublicCatalogue } from "../../src/server/pricing/catalogue";

const CATALOGUE = buildPublicCatalogue();
const match = (q: string) => findBestMatch(q, CATALOGUE);
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
  const deck = getMaterial("terrace_standard_impregnated")!;
  assert.equal(deck.referenceRetailPriceInclVat, 21);
  near(deck.referencePriceExVat, 21 / 1.25); // 16,80
  near(deck.referencePriceExVat, 16.8);

  const royal = getMaterial("terrace_royal")!;
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
    if (m.pricePending) {
      // Mangler pris → skal ikke ha en påstått pris liggende.
      assert.equal(m.referenceRetailPriceInclVat, null, `${m.id} pending`);
      assert.equal(m.referencePriceExVat, 0, `${m.id} pending`);
      assert.ok(m.pendingReason, `${m.id} mangler begrunnelse`);
    } else {
      assert.ok(m.referencePriceExVat > 0, `${m.id} pris`);
    }
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
  const deck = line.components.find((c) => c.materialId === "terrace_standard_impregnated")!;
  assert.equal(deck.netQuantity, 302.4);
  near(deck.grossQuantity, 332.64);          // + 10 % svinn
  near(deck.referencePriceExVat, 16.8);      // 21 / 1,25
  near(deck.rawCostExVat, 332.64 * 16.8);    // 5 588,35
  near(deck.protectionCostExVat, 332.64 * 16.8 * 0.1);
  near(deck.totalCostExVat, 332.64 * 16.8 * 1.1); // 6 147,19
});

test("TERRASSEBORD: skruforbruk følger av bjelkeavstand og skruer per kryss", () => {
  // 8,4 lm bord per m², kryss over bjelke hver 0,6 m, 2 skruer per kryss.
  const perM2 = MATERIAL_RECIPES.terraceDeckingOnly
    .dynamic!({ terraceFastening: "visible" })
    .components!.find((c) => c.materialId === "terrace_screws_c4")!
    .quantityPerUnit;
  assert.equal(perM2, 28);
  assert.equal(STRUCTURAL_ASSUMPTIONS.referenceJoistSpacingMm, 600);
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
  assert.ok(std.components.some((c) => c.materialId === "terrace_standard_impregnated"));
  assert.ok(prem.components.some((c) => c.materialId === "terrace_royal"));
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

test("TERRASSE: bæresystemet følger konstruksjonstypen, ikke ett universelt tall", () => {
  const per = (k: "ground" | "standard" | "elevated") =>
    calcMaterialLine({
      workItemKey: "terraceComplete",
      label: "T",
      unit: "m²",
      quantity: 36,
      tier: "standard",
      options: { terraceConstruction: k }
    }).components.find((c) => c.materialId === "timber_48x148_imp")!;

  assert.equal(per("ground").netQuantity, 36 * 3.0);
  assert.equal(per("standard").netQuantity, 36 * 3.5);
  assert.equal(per("elevated").netQuantity, 36 * 4.5);
  // Høyere terrasse koster mer i virke, aldri mindre.
  assert.ok(per("elevated").totalCostExVat > per("standard").totalCostExVat);
  assert.ok(per("standard").totalCostExVat > per("ground").totalCostExVat);
  assert.equal(TERRACE_CONSTRUCTIONS.standard.joistLmPerM2, 3.5);
});

test("TERRASSE: forbeholdet om at dette ikke er prosjektering følger med", () => {
  assert.match(TERRACE_STRUCTURAL_CAVEAT, /ikke\s+prosjektering/);
  assert.equal(
    MATERIAL_RECIPES.terraceComplete.customerNote,
    TERRACE_STRUCTURAL_CAVEAT
  );
});

test("FUNDAMENT: ligger aldri gjemt i materialprisen per m²", () => {
  const line = (k: "existing" | "simple" | "assess") =>
    calcMaterialLine({
      workItemKey: "terraceComplete",
      label: "T",
      unit: "m²",
      quantity: 36,
      tier: "standard",
      options: { terraceFoundation: k }
    });

  // Ingen av valgene endrer materialsummen — fundamentet er en egen post.
  const existing = line("existing");
  assert.equal(existing.pending.length, 0);
  for (const k of ["simple", "assess"] as const) {
    const l = line(k);
    assert.equal(l.materialExVat, existing.materialExVat);
    assert.equal(l.pending.length, 1);
  }
  assert.match(line("assess").pending[0].reason, /grunnforhold/);
  assert.match(line("simple").pending[0].reason, /egen post/);
  // Ingen komponent later som om den kjenner antall fundamentpunkter.
  assert.ok(
    existing.components.every((c) => !/fundament/i.test(c.name)),
    "fundament skal ikke ligge som materialkomponent"
  );
});

test("INNFESTING: CAMO har egen pris og er aldri billigere enn skruer", () => {
  const camo = getMaterial("terrace_hidden_fastening")!;
  assert.equal(camo.referenceRetailPriceInclVat, 1.7);
  near(camo.referencePriceExVat, 1.36, 0.0001);
  assert.equal(camo.wasteFactor, 0.05);
  assert.equal(camo.protectionFactor, 0.1);
  assert.ok(!camo.pricePending);

  const opts = { terraceFastening: "visible" } as const;
  const visible = calcMaterialLine({
    workItemKey: "terraceComplete", label: "T", unit: "m²", quantity: 36,
    tier: "standard", options: opts
  });
  const hidden = calcMaterialLine({
    workItemKey: "terraceComplete", label: "T", unit: "m²", quantity: 36,
    tier: "standard", options: { terraceFastening: "hidden" }
  });

  const c = hidden.components.find((x) => x.materialId === "terrace_hidden_fastening")!;
  assert.equal(c.netQuantity, 36 * 28);
  near(c.grossQuantity, 36 * 28 * 1.05);
  // Skjult innfesting skal aldri framstå som billigere enn synlig.
  assert.ok(hidden.materialExVat > visible.materialExVat);
  assert.equal(hidden.pending.length, 0);
});

test("CAMO-ARBEID: 10 % tillegg gjelder kun bordmonteringen", () => {
  assert.equal(FASTENING_LABOR_FACTORS.standardVisible, 1.0);
  assert.equal(FASTENING_LABOR_FACTORS.hiddenCamo, 1.1);

  // Komplett terrasse: 1,60 t/m². Bordmontering er 0,65 av dem.
  // 1,60 − 0,65 + 0,65 × 1,10 = 1,665
  assert.equal(
    resolveLaborHoursPerUnit("terraceComplete", { terraceFastening: "hidden" }),
    1.665
  );
  assert.equal(resolveLaborHoursPerUnit("terraceComplete", {}), 1.6);

  // Kun bordmontering: hele posten får tillegget.
  near(
    resolveLaborHoursPerUnit("terraceDeckingOnly", {
      terraceFastening: "hidden"
    })!,
    0.715
  );

  // Poster uten bordmontering røres ikke.
  assert.equal(
    resolveLaborHoursPerUnit("terraceRailing", { terraceFastening: "hidden" }),
    1.2
  );

  const hidden = calcLaborLine({
    workItemKey: "terraceComplete", label: "T", unit: "m²", quantity: 36,
    options: { terraceFastening: "hidden" }
  });
  near(hidden.totalLaborHours, 36 * 1.665);
  assert.ok(hidden.laborPriceExVat > 48960);
});

test("TERMOFURU: Royal-prisen brukes ikke som erstatning", () => {
  const thermo = getMaterial("terrace_thermowood")!;
  const royal = getMaterial("terrace_royal")!;
  assert.ok(thermo.pricePending);
  assert.equal(thermo.referencePriceExVat, 0);
  assert.ok(royal.referencePriceExVat > 0);

  const line = calcMaterialLine({
    workItemKey: "terraceComplete",
    materialRecipeKey: "terraceThermowood",
    label: "Terrasse m/ termofuru",
    unit: "m²",
    quantity: 36,
    tier: "premium"
  });
  // Bæresystem og skruer prises, bordet gjør det ikke.
  assert.ok(line.components.some((c) => c.materialId === "timber_48x148_imp"));
  assert.ok(line.components.every((c) => c.materialId !== "terrace_royal"));
  assert.ok(line.pending.some((pnd) => /[Tt]ermofuru/.test(pnd.label)));
  assert.match(
    line.pending.find((pnd) => /[Tt]ermofuru/.test(pnd.label))!.reason,
    /beregnes etter valgt produkt/
  );
});

test("KLEDNING: 19×148 rektangulær, 8,13 lm/m², 50 kr/lm inkl. mva", () => {
  assert.equal(STRUCTURAL_ASSUMPTIONS.claddingLmPerM2, 8.13);
  const c = getMaterial("cladding_19x148_rectangular")!;
  assert.equal(c.referenceRetailPriceInclVat, 50);
  assert.equal(c.referencePriceExVat, 40);
  assert.equal(c.dimension, "19x148");
  assert.equal(c.profile, "rectangular");
  assert.equal(c.orientation, "vertical");
  assert.equal(c.consumptionLmPerM2, 8.13);
  assert.equal(c.lastUpdated, "2026-09-16");
  assert.equal(c.wasteFactor, 0.1);
  assert.equal(c.protectionFactor, 0.1);

  // 100 m² fasade: 813 lm → 894,3 lm etter svinn × 40 kr × 1,10 buffer.
  const line = calcMaterialLine({
    workItemKey: "timberCladding", label: "Kledning", unit: "m²",
    quantity: 100, tier: "standard"
  });
  const comp = line.components.find(
    (x) => x.materialId === "cladding_19x148_rectangular"
  )!;
  assert.equal(comp.netQuantity, 813);
  near(comp.grossQuantity, 894.3);
  near(comp.rawCostExVat, 894.3 * 40);
  near(comp.totalCostExVat, 894.3 * 40 * 1.1);
  // Bufferen legges på én gang, ikke to.
  near(comp.protectionCostExVat, 894.3 * 40 * 0.1);
});

test("FASADE: full oppskrift, men etterisolering kun når den er valgt", () => {
  const base = calcMaterialLine({
    workItemKey: "facadeComplete", label: "Fasade", unit: "m²",
    quantity: 100, tier: "standard"
  });
  const ids = base.components.map((c) => c.materialId);
  assert.ok(ids.includes("cladding_19x148_rectangular"));
  assert.ok(ids.includes("wind_barrier"));
  assert.ok(ids.includes("batten_36x48_imp"));
  // Ikke inkludert med mindre den velges.
  assert.ok(!ids.includes("insulation_100mm"));

  const insulated = calcMaterialLine({
    workItemKey: "facadeComplete", label: "Fasade", unit: "m²",
    quantity: 100, tier: "standard", options: { facadeInsulation: "mm100" }
  });
  assert.ok(
    insulated.components.some((c) => c.materialId === "insulation_100mm")
  );
  assert.ok(insulated.materialExVat > base.materialExVat);

  const other = calcMaterialLine({
    workItemKey: "facadeComplete", label: "Fasade", unit: "m²",
    quantity: 100, tier: "standard", options: { facadeInsulation: "other" }
  });
  assert.ok(
    other.pending.some((pnd) => /isolasjonstykkelse/.test(pnd.reason))
  );

  // Festemidler og teip er navngitt, ikke gjemt i et prosenttillegg.
  assert.ok(base.pending.some((pnd) => /[Ff]estemidler/.test(pnd.label)));
  assert.ok(base.pending.some((pnd) => /[Tt]eip/.test(pnd.label)));
});

test("SMÅFORBRUK: generisk prosenttillegg er slått av — ingen dobbeltpolstring", () => {
  assert.equal(pricingSettings.smallConsumablesRate, 0);

  const line = calcMaterialLine({
    workItemKey: "plasterboardSingleLayer", label: "Gips", unit: "m²",
    quantity: 10, tier: "standard"
  });
  const priced = line.components.reduce((s, c) => s + c.totalCostExVat, 0);
  assert.equal(line.smallConsumablesExVat, 0);
  near(line.materialExVat, priced);
  // Svinn og buffer er fortsatt to atskilte tall.
  assert.notEqual(line.wasteExVat, line.protectionExVat);
  assert.ok(line.wasteExVat > 0 && line.protectionExVat > 0);

  // Mekanismen finnes fortsatt, slik at den kan slås på senere.
  assert.equal(typeof pricingSettings.smallConsumablesRate, "number");
});

test("VESENTLIGE FORBRUKSVARER ligger som egne materialer, ikke i en prosentsats", () => {
  for (const id of [
    "terrace_screws_c4",
    "wind_barrier_tape",
    "cladding_fasteners",
    "terrace_hidden_fastening"
  ]) {
    assert.ok(getMaterial(id), `${id} mangler i databasen`);
  }
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
  near(m.totalMaterialExVat, terrace.materialExVat, 0.05);
  // Ingen skjult prosentpolstring — småforbruk er slått av.
  assert.equal(m.totalSmallConsumablesExVat, 0);
  assert.ok(m.totalWasteExVat > 0);
  assert.ok(m.totalProtectionExVat > 0);
  assert.equal(m.unpriced.length, 1);
  assert.equal(m.unpriced[0].workItemKey, "terraceRailing");
  // Standardterrassen er nå fullt priset, så ingen linje er et gulv.
  assert.equal(m.hasFloorLines, false);
  assert.equal(m.materialEstimateComplete, false); // rekkverket mangler pris
  // … men velger kunden fundament som må vurderes, blir den det.
  const withFoundation = calcMaterialTotal([
    { ...multiJob[0], tier: "standard", options: { terraceFoundation: "assess" } }
  ]);
  assert.equal(withFoundation.hasFloorLines, true);
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

test("KARTLEGGING: terrassevariantene har egne materialer", () => {
  const hidden = PRICE_DB.find((e) => e.name === "Terrasse m/ skjult innfesting")!;
  const thermo = PRICE_DB.find((e) => e.name === "Terrasse m/ termofuru")!;

  // Samme arbeidstimer som en vanlig komplett terrasse …
  assert.equal(hidden.workItemKey, "terraceComplete");
  assert.equal(thermo.workItemKey, "terraceComplete");
  // … men skjult innfesting er et valg, og termofuru en egen oppskrift.
  assert.equal(hidden.terraceFastening, "hidden");
  assert.equal(thermo.materialRecipeKey, "terraceThermowood");

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
  // Bæresystemet kan prises, så materialer er tilgjengelig — men som gulv.
  assert.equal(r.scenarios.standard.isFloor, true);
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
    const m = match(q);
    assert.equal(m?.name, expected, `"${q}" traff feil`);
  }
});

test("SØK: ingen vilkårlig delstrengmatching — ord matches på ordgrense", () => {
  // «tak» står inni «kontakt», «stakittgjerde» og «betakning».
  for (const q of ["kontakt", "kontakt meg", "ta kontakt om noe", "stakittgjerde", "betakning"]) {
    const m = match(q);
    assert.notEqual(m?.name, "Taktekking (takstein)", `"${q}" traff taktekking`);
  }
  // «ny» står inni «vinyl».
  assert.notEqual(match("ny terrasse")?.name, "Vinylgulv");
  // «vindu» er ikke en bøying av «vindusrestaurering».
  assert.notEqual(
    match("vindu")?.name,
    "Restaurering av originalt vindu"
  );
  // «dør» er ikke en bøyningsendelse — «terrasse» ≠ «terrassedør».
  assert.equal(match("terrasse")?.name, "Bygging av terrasse (standard)");
  assert.equal(match("terrassedør")?.name, "Montering terrassedør");
});

test("SØK: bøying og sammensatte ord treffer fortsatt", () => {
  assert.equal(wordMatches("vindu", "vinduer"), true);
  assert.equal(wordMatches("terrassen", "terrasse"), true);
  assert.equal(wordMatches("bordkledning", "kledning"), true); // sammensatt
  assert.equal(wordMatches("parkettgulv", "parkett"), true);
  // Korte ord kan ikke bli ledd i sammensetninger.
  assert.equal(wordMatches("kontakt", "tak"), false);
  assert.equal(wordMatches("vinyl", "ny"), false);
  // «dør» er ingen endelse.
  assert.equal(wordMatches("terrassedør", "terrasse"), true); // sammensatt, ok
  assert.equal(wordMatches("terrasse", "terrassedør"), false);
});

test("SØK: tomt og useriøst søk gir ingen match i stedet for feil match", () => {
  assert.equal(match(""), null);
  assert.equal(match("x"), null);
  assert.equal(match("qwerty zxcvb"), null);
  assert.equal(match("!!! ???"), null);
});

test("SØK: kontrollerte aliaser for vanlige enkeltordsøk", () => {
  const cases: Array<[string, string]> = [
    ["gulv", "Montering gulv"],
    ["lister", "Listing"],
    ["listeverk", "Listing"],
    ["himling", "Himling"],
    ["camo", "Terrasse m/ skjult innfesting"],
    ["skyvedør", "Montering skyvedør"],
    ["riving av kledning", "Riving av kledning"]
  ];
  for (const [q, expected] of cases) {
    assert.equal(match(q)?.name, expected, `"${q}" traff feil`);
  }
});

test("KARTLEGGING: ingen foreldreløse arbeidsposter", () => {
  const selectable = new Set(
    PRICE_DB.filter((e) => e.workItemKey).map((e) => e.workItemKey!)
  );
  const orphans = Object.keys(WORK_ITEMS).filter((k) => !selectable.has(k));
  assert.deepEqual(
    orphans,
    [],
    `arbeidsposter uten vei inn i kalkulatoren: ${orphans.join(", ")}`
  );
});

/* ══════════════════ HIMLING, GULV, LIST, VEGGER ══════════════════ */

test("HIMLING: tre typer med forskjellig arbeid og oppskrift", () => {
  assert.equal(CEILING_TYPES.direct.laborHoursPerUnit, 0.9);
  assert.equal(CEILING_TYPES.battened.laborHoursPerUnit, 1.2);
  assert.equal(CEILING_TYPES.suspended.laborHoursPerUnit, null);

  assert.equal(resolveLaborHoursPerUnit("ceilingWork", {}), 0.9);
  assert.equal(
    resolveLaborHoursPerUnit("ceilingWork", { ceilingType: "battened" }),
    1.2
  );

  const direct = calcMaterialLine({
    workItemKey: "ceilingWork", label: "Himling", unit: "m²",
    quantity: 20, tier: "standard", options: { ceilingType: "direct" }
  });
  const battened = calcMaterialLine({
    workItemKey: "ceilingWork", label: "Himling", unit: "m²",
    quantity: 20, tier: "standard", options: { ceilingType: "battened" }
  });
  // Nedlektet er ikke samme jobb — lekter i tillegg til plate.
  assert.ok(direct.components.every((c) => c.materialId !== "batten_36x48_imp"));
  assert.ok(battened.components.some((c) => c.materialId === "batten_36x48_imp"));
  assert.ok(battened.materialExVat > direct.materialExVat);
});

test("HIMLING: nedforet gir tekst, ikke 0 kr", () => {
  const l = calcLaborLine({
    workItemKey: "ceilingWork", label: "Himling", unit: "m²",
    quantity: 20, options: { ceilingType: "suspended" }
  });
  assert.equal(l.laborPending, true);
  assert.equal(l.laborPriceExVat, 0);
  assert.match(String(l.pendingNote), /Må vurderes etter ønsket nedforing/);

  const m = calcMaterialLine({
    workItemKey: "ceilingWork", label: "Himling", unit: "m²",
    quantity: 20, tier: "standard", options: { ceilingType: "suspended" }
  });
  assert.equal(m.materialExVat, 0);
  assert.equal(m.status, "pending");

  const r = calculateEstimate([
    {
      workItemKey: "ceilingWork", label: "Himling", unit: "m²",
      quantity: 20, options: { ceilingType: "suspended" }
    }
  ]);
  assert.equal(r.hasPendingLabor, true);
});

test("GULV: manglende underlagspris blir aldri stilltiende 0", () => {
  for (const id of ["standard_underlay", "acoustic_underlay"]) {
    const m = getMaterial(id)!;
    assert.ok(m.pricePending, `${id} skal være upriset`);
    assert.match(String(m.pendingReason), /[Uu]nderlag/);
  }
  const line = calcMaterialLine({
    workItemKey: "flooringInstallation", label: "Gulv", unit: "m²",
    quantity: 30, tier: "standard"
  });
  // Gulvbelegget prises, underlaget navngis.
  assert.ok(line.components.some((c) => c.materialId === "laminate_standard"));
  assert.ok(line.pending.some((pnd) => /[Uu]nderlag|[Tt]rinnlyd/.test(pnd.label)));
  assert.equal(line.status, "partial");

  const total = calcMaterialTotal([
    { workItemKey: "flooringInstallation", label: "Gulv", unit: "m²", quantity: 30, tier: "standard" }
  ]);
  assert.equal(total.materialEstimateComplete, false);
});

test("LISTING: arbeid regnes, materialet navngis", () => {
  const l = calcLaborLine({
    workItemKey: "trimInstallation", label: "Listing", unit: "lm", quantity: 40
  });
  assert.equal(l.laborHoursPerUnit, 0.12);
  assert.equal(l.totalLaborHours, 4.8);
  assert.equal(l.laborPriceExVat, 4080);
  assert.equal(l.laborPending, false);

  const m = calcMaterialLine({
    workItemKey: "trimInstallation", label: "Listing", unit: "lm",
    quantity: 40, tier: "standard"
  });
  assert.equal(m.materialExVat, 0);
  assert.equal(m.status, "pending");
  assert.match(String(m.customerNote), /avhenger av valgt list/);
});

test("SKILLEVEGG: to tydelig forskjellige omfang", () => {
  assert.equal(PARTITION_SCOPES.complete.laborHoursPerUnit, 1.4);
  assert.equal(PARTITION_SCOPES.framingOnly.laborHoursPerUnit, 0.7);
  assert.equal(
    resolveLaborHoursPerUnit("interiorPartitionWall", { partitionScope: "framingOnly" }),
    0.7
  );

  const framing = calcMaterialLine({
    workItemKey: "interiorPartitionWall", label: "Vegg", unit: "m²",
    quantity: 20, tier: "standard", options: { partitionScope: "framingOnly" }
  });
  const complete = calcMaterialLine({
    workItemKey: "interiorPartitionWall", label: "Vegg", unit: "m²",
    quantity: 20, tier: "standard", options: { partitionScope: "complete" }
  });

  // A: kun bindingsverk.
  assert.deepEqual(
    framing.components.map((c) => c.materialId),
    ["timber_48x98_imp"]
  );
  // B: bindingsverk + isolasjon + gips på begge sider.
  const gips = complete.components.find(
    (c) => c.materialId === "plasterboard_standard"
  )!;
  assert.equal(gips.netQuantity, 40); // 2 m² per m² vegg
  const iso = complete.components.find(
    (c) => c.materialId === "insulation_100mm"
  )!;
  assert.equal(iso.netQuantity, 20); // 1 m² per m² vegg
  assert.ok(complete.materialExVat > framing.materialExVat);

  assert.match(
    String(MATERIAL_RECIPES.interiorPartitionWall.customerNote),
    /Sparkling og maling er ikke inkludert/
  );
});

test("LEVEGG: m² overalt — ingen lm igjen", () => {
  assert.equal(WORK_ITEMS.privacyScreen.unit, "m²");
  assert.equal(WORK_ITEMS.privacyScreen.laborHoursPerUnit, 1.0);
  assert.equal(MATERIAL_RECIPES.privacyScreen.unit, "m²");

  const entries = PRICE_DB.filter((e) => /levegg/i.test(e.name));
  assert.ok(entries.length > 0);
  // Ingen levegg-post bruker lm lenger.
  for (const e of entries) {
    assert.equal(e.unit, "m²", `"${e.name}" bruker fortsatt ${e.unit}`);
  }
  assert.equal(
    entries.find((e) => e.name === "Levegg (tre)")!.workItemKey,
    "privacyScreen"
  );

  // 3 m × 2 m levegg = 6 m² → 6 timer.
  const l = calcLaborLine({
    workItemKey: "privacyScreen", label: "Levegg", unit: "m²", quantity: 3 * 2
  });
  assert.equal(l.totalLaborHours, 6);
  assert.equal(l.laborPriceExVat, 5100);
});

test("ETTERISOLERING: 100 mm er standard valgbart alternativ", () => {
  assert.equal(INSULATION_OPTIONS.mm100.thicknessMm, 100);
  assert.deepEqual(INSULATION_OPTION_ORDER, ["none", "mm100", "other"]);

  const std = calcMaterialLine({
    workItemKey: "exteriorInsulation", label: "Etterisolering", unit: "m²",
    quantity: 50, tier: "standard"
  });
  assert.ok(std.components.some((c) => c.materialId === "insulation_100mm"));
  assert.equal(std.pending.length, 0);

  const other = calcMaterialLine({
    workItemKey: "exteriorInsulation", label: "Etterisolering", unit: "m²",
    quantity: 50, tier: "standard", options: { facadeInsulation: "other" }
  });
  assert.equal(other.materialExVat, 0);
  assert.match(String(other.customerNote), /valgt isolasjonstykkelse/);
});

/* ══════════════════ REGEL 12 ══════════════════ */

test("REGEL 12: manglende materialpris kan aldri bli stilltiende 0", () => {
  // Alle poster med minst ett upriset materiale må flagges.
  const cases: Array<[string, Record<string, unknown>]> = [
    ["flooringInstallation", {}],
    ["trimInstallation", {}],
    ["facadeComplete", {}],
    ["ceilingWork", { ceilingType: "suspended" }]
  ];
  for (const [key, options] of cases) {
    const total = calcMaterialTotal([
      { workItemKey: key, label: key, unit: "m²", quantity: 25, tier: "standard", options }
    ]);
    assert.equal(
      total.materialEstimateComplete,
      false,
      `${key} presenteres som komplett materialpris`
    );
  }

  // En post der alt er priset skal derimot være komplett.
  const ok = calcMaterialTotal([
    { workItemKey: "terraceComplete", label: "T", unit: "m²", quantity: 36, tier: "standard" }
  ]);
  assert.equal(ok.materialEstimateComplete, true);

  // Ingen komponent har noen gang pris 0.
  for (const l of ok.lines) {
    for (const c of l.components) assert.ok(c.referencePriceExVat > 0);
  }
});
