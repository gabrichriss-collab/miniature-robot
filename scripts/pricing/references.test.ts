/**
 * Tester for referansepris-registeret og sammenligningen.
 *
 * VIKTIG: repoet er offentlig. Testene bruker derfor SYNTETISKE poster —
 * ingen ekte koder eller beløp fra noen tredjepartskilde står her. Mot de
 * ekte (gitignorerte) dataene kjøres bare strukturelle kontroller, og bare
 * når filen faktisk finnes på maskinen.
 *
 *   npm test
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  loadReferenceRegistry,
  parseReferenceFile,
  referencesDir,
  usableAsCustomerRate,
  validateRecord,
  validateRegistry
} from "../../src/server/pricing/references/registry";
import {
  canAddReferenceOnTopOfModel,
  compareRecord,
  coverageTable,
  detectReferenceOverlaps,
  modelFigures,
  ourTerraceScope,
  referenceScope,
  STANDARD_TERRACE_OPTIONS,
  terraceComparison,
  vatReadings
} from "../../src/server/pricing/references/compare";
import {
  SCOPE_DIMENSIONS,
  type ReferencePriceRecord,
  type ScopeMatrix
} from "../../src/server/pricing/references/types";
import { calculateEstimate } from "../../src/server/pricing/calculateEstimate";
import { pricingSettings } from "../../src/server/pricing/settings";
import { toCustomerEstimate } from "../../src/server/pricing/toCustomerEstimate";
import { buildPublicCatalogue } from "../../src/server/pricing/catalogue";

/* ── Syntetiske poster ─────────────────────────────────────────── */

/** Gyldig, uverifisert referanse — slik alle nye poster skal se ut. */
function synth(over: Partial<ReferencePriceRecord> = {}): ReferencePriceRecord {
  return {
    internalId: "syn-01",
    source: "EG_HOLTE_SMARTKALK",
    sourceCode: "9.999.99.1",
    sourceVariant: null,
    sourceVariantIsLocal: false,
    description: "Syntetisk terrassegulv",
    category: "TERRACE_OUTDOOR",
    unit: "m²",
    referencePriceNok: 1000,
    vatBasis: "UNKNOWN",
    capturedDate: "2000-01-01",
    inclusionStatus: "UNVERIFIED",
    includesLabor: "UNKNOWN",
    includesMaterials: "UNKNOWN",
    includesOverhead: "UNKNOWN",
    priceStatus: "REFERENCE_ONLY",
    verificationStatus: "REFERENCE_UNVERIFIED",
    applicableConditions: [],
    excludedWork: [],
    requiresProfessionalAssessment: false,
    evidence: "syntetisk",
    reviewedBy: null,
    reviewedAt: null,
    notes: "",
    modelMappings: [
      { workItemKey: "terraceComplete", comparability: "SCOPE_DIFFERS", reason: "syntetisk" }
    ],
    ...over
  };
}

/** Fullt verifisert post der alt er kjent. */
const verified = (over: Partial<ReferencePriceRecord> = {}) =>
  synth({
    vatBasis: "EX_VAT",
    inclusionStatus: "VERIFIED",
    includesLabor: "NO",
    includesMaterials: "NO",
    includesOverhead: "NO",
    verificationStatus: "REFERENCE_VERIFIED",
    reviewedBy: "eier",
    reviewedAt: "2000-01-02",
    ...over
  });

/** Modellomfang for en fasade med isolasjon — for isolasjonsregelen. */
function facadeScopeWithInsulation(): ScopeMatrix {
  const m = {} as ScopeMatrix;
  for (const d of SCOPE_DIMENSIONS) m[d] = { value: "NO", basis: "syntetisk" };
  m.insulation = { value: "YES", basis: "syntetisk: 100 mm etterisolering" };
  m.laborInclusion = { value: "YES", basis: "syntetisk" };
  return m;
}

/* ── Skjema og validering ──────────────────────────────────────── */

test("REGISTER: en uverifisert post med UNKNOWN-felter er gyldig", () => {
  assert.deepEqual(validateRecord(synth()), []);
});

test("REGISTER: inkludering må være YES/NO/UNKNOWN — aldri boolsk eller tom", () => {
  const bad = { ...synth(), includesLabor: true } as unknown;
  assert.ok(validateRecord(bad).some((e) => e.includes("includesLabor")));
  const missing = { ...synth() } as Record<string, unknown>;
  delete missing.includesMaterials;
  assert.ok(validateRecord(missing).some((e) => e.includes("includesMaterials")));
});

test("REGISTER: uverifisert inkludering kan ikke påstå at arbeid inngår", () => {
  const errs = validateRecord(synth({ includesLabor: "YES" }));
  assert.ok(errs.some((e) => e.includes("uverifisert")));
});

test("REGISTER: ukjent eller ugyldig pris blir aldri stille 0", () => {
  for (const price of [0, -1, Number.NaN, Infinity, null, "793"]) {
    const errs = validateRecord({ ...synth(), referencePriceNok: price });
    assert.ok(errs.length > 0, `pris ${String(price)} skulle vært avvist`);
  }
  // En fil med én ugyldig post lastes ikke i det hele tatt.
  const text = JSON.stringify({ schemaVersion: 1, description: "t", records: [synth(), { ...synth({ internalId: "syn-02" }), referencePriceNok: 0 }] });
  const res = parseReferenceFile(text, "t.json");
  assert.equal(res.records.length, 0);
  assert.ok(res.errors.length > 0);
});

test("REGISTER: verifisert post må ha mva-grunnlag og kontrollør", () => {
  const errs = validateRecord(synth({ verificationStatus: "REFERENCE_VERIFIED" }));
  assert.ok(errs.some((e) => e.includes("mva-grunnlag")));
  assert.ok(errs.some((e) => e.includes("reviewedBy")));
});

test("REGISTER: poster som deler elementkode må ha hver sin variant-ID", () => {
  const a = synth({ internalId: "a", sourceVariant: null });
  const b = synth({ internalId: "b", sourceVariant: null });
  assert.ok(validateRegistry([a, b]).some((e) => e.includes("sourceVariant")));
  const c = synth({ internalId: "c", sourceVariant: "V1", sourceVariantIsLocal: true });
  const d = synth({ internalId: "d", sourceVariant: "V1", sourceVariantIsLocal: true });
  assert.ok(validateRegistry([c, d]).some((e) => e.includes("samme sourceVariant")));
  const e2 = synth({ internalId: "e", sourceVariant: "V2", sourceVariantIsLocal: true });
  assert.deepEqual(validateRegistry([c, e2]), []);
});

test("REGISTER: like internalId avvises", () => {
  assert.ok(validateRegistry([synth(), synth()]).some((e) => e.includes("internalId")));
});

test("REGISTER: manglende mappe gir tomt register, ikke feil", () => {
  const r = loadReferenceRegistry(join(referencesDir(), "finnes-ikke-xyz"));
  assert.deepEqual(r, { records: [], files: [], errors: [] });
});

test("REGISTER: det committede eksempelet er gyldig og tydelig syntetisk", () => {
  const text = readFileSync("src/server/pricing/references/reference-file.example.json", "utf8");
  const res = parseReferenceFile(text, "example");
  assert.deepEqual(res.errors, []);
  assert.match(text, /SYNTETISK/);
});

/* ── Bruksvakt ─────────────────────────────────────────────────── */

test("VAKT: referansepriser er aldri kundesats så lenge noe er ukjent", () => {
  assert.equal(usableAsCustomerRate(synth()), false);
  assert.equal(usableAsCustomerRate(synth({ priceStatus: "VALIDATED" })), false);
  assert.equal(usableAsCustomerRate(verified()), false, "REFERENCE_ONLY skal fortsatt si nei");
  assert.equal(usableAsCustomerRate(verified({ priceStatus: "VALIDATED", requiresProfessionalAssessment: true })), false);
  assert.equal(usableAsCustomerRate(verified({ priceStatus: "VALIDATED", vatBasis: "UNKNOWN" })), false);
  assert.equal(usableAsCustomerRate(verified({ priceStatus: "VALIDATED" })), true);
});

/* ── Mva ───────────────────────────────────────────────────────── */

test("MVA: ukjent grunnlag gir begge tolkninger, aldri én gjetning", () => {
  const v = vatReadings(synth({ referencePriceNok: 1000 }), 10);
  assert.equal(v.asGiven, 10000);
  assert.equal(v.exVatIfSourceIncVat, 8000);
  assert.deepEqual(v.exVatCandidates, [10000, 8000]);
});

test("MVA: kjent grunnlag gir én eks. mva-verdi — mva tas av nøyaktig én gang", () => {
  assert.deepEqual(vatReadings(synth({ vatBasis: "EX_VAT", referencePriceNok: 1000 }), 2).exVatCandidates, [2000]);
  const inc = vatReadings(synth({ vatBasis: "INC_VAT", referencePriceNok: 1250 }), 2);
  assert.deepEqual(inc.exVatCandidates, [2000]);
  assert.equal(1250 * 2 / (1 + pricingSettings.vatRate), 2000);
});

/* ── Dobbelttelling (§7) ───────────────────────────────────────── */

test("DOBBELTTELLING: elementpris med (mulig) arbeid kan ikke legges oppå vårt arbeid", () => {
  const ours = ourTerraceScope("terraceComplete", STANDARD_TERRACE_OPTIONS);
  for (const labor of ["UNKNOWN", "YES"] as const) {
    const v = canAddReferenceOnTopOfModel(synth({ includesLabor: labor, scope: {} }), ours);
    assert.equal(v.allowed, false);
    assert.ok(v.reasons.some((r) => r.includes("dobbelt arbeid")));
  }
});

test("DOBBELTTELLING: terrassebord telles ikke to ganger", () => {
  const ours = ourTerraceScope("terraceComplete", STANDARD_TERRACE_OPTIONS);
  const ref = verified({ scope: { deckingMaterial: { value: "YES", basis: "syntetisk" } } });
  const v = canAddReferenceOnTopOfModel(ref, ours);
  assert.equal(v.allowed, false);
  assert.ok(v.reasons.some((r) => r.startsWith("deckingMaterial")));
});

test("DOBBELTTELLING: isolasjon legges ikke på to ganger", () => {
  const ref = verified({ scope: { insulation: { value: "YES", basis: "syntetisk" } } });
  const v = canAddReferenceOnTopOfModel(ref, facadeScopeWithInsulation());
  assert.equal(v.allowed, false);
  assert.ok(v.reasons.some((r) => r.startsWith("insulation")));
});

test("DOBBELTTELLING: grunnarbeid i to referanseposter flagges", () => {
  const g = { groundPreparation: { value: "YES" as const, basis: "syntetisk" } };
  const issues = detectReferenceOverlaps([
    synth({ internalId: "g1", scope: g }),
    synth({ internalId: "g2", scope: g })
  ]);
  assert.ok(issues.some((i) => i.startsWith("groundPreparation")));
  assert.deepEqual(detectReferenceOverlaps([synth({ internalId: "g1", scope: g })]), []);
});

test("DOBBELTTELLING: rekkverk og trapp er egne poster — en ren rekkverksreferanse kan legges til", () => {
  const ours = ourTerraceScope("terraceComplete", STANDARD_TERRACE_OPTIONS);
  assert.equal(ours.railing.value, "NO");
  assert.equal(ours.stairs.value, "NO");
  // Fullt kjent, eks. mva, uten arbeid/materialer i overlapp, og omfanget
  // er kun rekkverk (alt annet NO) → eneste tilfelle som tillates.
  const scope: Partial<ScopeMatrix> = {};
  for (const d of SCOPE_DIMENSIONS) scope[d] = { value: "NO", basis: "syntetisk" };
  scope.railing = { value: "YES", basis: "syntetisk" };
  const v = canAddReferenceOnTopOfModel(verified({ scope }), ours);
  assert.deepEqual(v, { allowed: true, reasons: [] });
});

test("DOBBELTTELLING: ukjent mva-grunnlag stopper alltid kombinasjon", () => {
  const ours = ourTerraceScope("terraceComplete", STANDARD_TERRACE_OPTIONS);
  const v = canAddReferenceOnTopOfModel(verified({ vatBasis: "UNKNOWN" }), ours);
  assert.ok(v.reasons.some((r) => r.includes("mva")));
});

/* ── Enheter og sammenlignbarhet ──────────────────────────────── */

test("ENHET: lm sammenlignes aldri med m² — og ingen tall vises", () => {
  const r = synth({
    unit: "lm",
    modelMappings: [
      { workItemKey: "privacyScreen", comparability: "SCOPE_DIFFERS", reason: "syntetisk" },
      { workItemKey: "terraceRailing", comparability: "SCOPE_DIFFERS", reason: "syntetisk" }
    ]
  });
  const [screen, railing] = compareRecord(r, 10);
  assert.equal(screen.status, "UNIT_MISMATCH");
  assert.equal(screen.model, undefined);
  assert.equal(screen.reference, undefined);
  assert.equal(railing.status, "COMPARED");
  assert.equal(railing.model?.unit, "lm");
});

test("ENHET: stk mot m² stoppes også", () => {
  const r = synth({ unit: "stk" });
  assert.equal(compareRecord(r, 1)[0].status, "UNIT_MISMATCH");
});

test("TAKTERRASSE: en NOT_COMPARABLE-kobling gir ingen tall mot vanlig terrasse", () => {
  const r = synth({
    modelMappings: [{ workItemKey: "terraceComplete", comparability: "NOT_COMPARABLE", reason: "takterrasse" }]
  });
  const [c] = compareRecord(r, 36);
  assert.equal(c.status, "NOT_COMPARABLE");
  assert.equal(c.model, undefined);
  assert.equal(c.indicativeRatios, undefined);
});

test("SAMMENLIGNING: ukjent arbeidspost gir status, ikke krasj eller 0", () => {
  const r = synth({ modelMappings: [{ workItemKey: "finnesIkke", comparability: "PARTIAL", reason: "x" }] });
  assert.equal(compareRecord(r)[0].status, "UNKNOWN_WORK_ITEM");
});

/* ── 36 m² terrasse — regresjon ────────────────────────────────── */

test("REGRESJON: 36 m² terrasse er uendret — 48 960 kr arbeid eks. mva", () => {
  const f = modelFigures("terraceComplete", 36, STANDARD_TERRACE_OPTIONS)!;
  assert.equal(f.laborExVat, 48960);
  assert.equal(pricingSettings.hourlyRateExVat, 850);
});

test("REGRESJON: 36 m² terrasse — materialsummene fra motoren er uendret", () => {
  const f = modelFigures("terraceComplete", 36, STANDARD_TERRACE_OPTIONS)!;
  assert.equal(f.standard.materialExVat, 12431);
  assert.equal(f.premium.materialExVat, 18871);
  assert.equal(f.standard.complete, true);
  assert.equal(f.premium.complete, true);
});

test("REGRESJON: sammenligningen bruker den ekte motoren, ikke egne formler", () => {
  const f = modelFigures("terraceComplete", 36, STANDARD_TERRACE_OPTIONS)!;
  const e = calculateEstimate([
    { workItemKey: "terraceComplete", label: "t", unit: "m²", quantity: 36, options: STANDARD_TERRACE_OPTIONS }
  ]);
  assert.equal(f.laborExVat, Math.round(e.labor.totalLaborExVat));
  assert.equal(f.standard.totalExVat, Math.round(e.scenarios.standard.subtotalExVat));
  assert.equal(f.premium.totalExVat, Math.round(e.scenarios.premium.subtotalExVat));
});

test("KUN ARBEID vs MATERIALER: materialene legges oppå samme arbeid", () => {
  const f = modelFigures("terraceComplete", 36, STANDARD_TERRACE_OPTIONS)!;
  assert.equal(f.standard.totalExVat, f.laborExVat + f.standard.materialExVat);
  assert.equal(f.premium.totalExVat, f.laborExVat + f.premium.materialExVat);
});

test("VARIANTER: termofuru/Kebony gir ufullstendig materialsum — aldri en falsk komplett pris", () => {
  const f = modelFigures("terraceComplete", 36, STANDARD_TERRACE_OPTIONS, "terraceThermowood")!;
  assert.equal(f.laborExVat, 48960, "samme arbeid");
  assert.equal(f.standard.complete, false);
  assert.ok(f.standard.materialExVat > 0, "bæresystemet er priset");
  const plain = modelFigures("terraceComplete", 36, STANDARD_TERRACE_OPTIONS)!;
  assert.ok(f.standard.materialExVat < plain.standard.materialExVat, "bordprisen er ikke gjettet inn");
});

test("TERRASSE: omfangsmatrisen dekker alle dimensjoner, og bæresystem følger oppskriften", () => {
  const full = ourTerraceScope("terraceComplete", STANDARD_TERRACE_OPTIONS);
  const deck = ourTerraceScope("terraceDeckingOnly", STANDARD_TERRACE_OPTIONS);
  for (const d of SCOPE_DIMENSIONS) {
    assert.ok(full[d] && deck[d], `mangler ${d}`);
  }
  assert.equal(full.structuralFramework.value, "YES");
  assert.equal(deck.structuralFramework.value, "NO");
  assert.equal(full.groundPreparation.value, "NO");
  assert.equal(full.foundations.value, "NO");
});

test("TERRASSE: referanseomfang er UNKNOWN med mindre posten sier noe", () => {
  const s = referenceScope(synth());
  for (const d of SCOPE_DIMENSIONS) assert.equal(s[d].value, "UNKNOWN", d);
});

test("TERRASSE: 36 m²-sammenligningen tar bare med m²-poster", () => {
  const tc = terraceComparison([synth(), synth({ internalId: "lm", unit: "lm" })], 36);
  assert.deepEqual(tc.references.map((r) => r.record.internalId), ["syn-01"]);
});

test("DEKNING: alle etterspurte arbeidstyper har en rad med utfall", () => {
  const rows = coverageTable();
  assert.ok(rows.length >= 12);
  for (const r of rows) assert.ok(["AUTO", "PARTIAL", "ASSESS", "MISSING"].includes(r.customerOutcome));
  assert.equal(rows.find((r) => r.label === "Standard terrasse")?.customerOutcome, "AUTO");
});

/* ── Sikkerhet ─────────────────────────────────────────────────── */

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const f = join(dir, n);
    return statSync(f).isDirectory() ? walk(f) : [f];
  });

test("SIKKERHET: ingenting utenfor registeret importerer referansedata", () => {
  const offenders = walk("src")
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .filter((f) => !f.startsWith(join("src", "server", "pricing", "references")))
    .filter((f) => /pricing\/references|from "\.\/references|from "\.\.\/references/.test(readFileSync(f, "utf8")));
  assert.deepEqual(offenders, []);
});

test("SIKKERHET: samleinngangen til prismotoren eksporterer ikke registeret", () => {
  const idx = readFileSync("src/server/pricing/index.ts", "utf8");
  assert.ok(!idx.includes("references"));
});

test("SIKKERHET: alle registermoduler er server-only", () => {
  for (const f of walk(join("src", "server", "pricing", "references")).filter((x) => x.endsWith(".ts"))) {
    assert.match(readFileSync(f, "utf8"), /^import "server-only";/, f);
  }
});

test("SIKKERHET: offentlig API-svar og katalog nevner ingen referansefelt", () => {
  const dto = toCustomerEstimate(
    [{ id: "1", quantity: 36, unit: "m²" }],
    [{ requestId: "1", workItemKey: "terraceComplete", label: "t", unit: "m²", quantity: 36, options: STANDARD_TERRACE_OPTIONS }],
    "standard"
  );
  const json = JSON.stringify(dto) + JSON.stringify(buildPublicCatalogue());
  for (const word of ["EG_HOLTE", "SMARTKALK", "sourceCode", "referencePriceNok", "vatBasis", "includesLabor", "REFERENCE_"]) {
    assert.ok(!json.includes(word), `${word} lekket ut`);
  }
});

test("SIKKERHET: referansemappen er gitignorert", () => {
  assert.match(readFileSync(".gitignore", "utf8"), /^\/private\/$/m);
});

/* ── Ekte data — kun strukturelle kontroller, kun når filen finnes ── */

const real = loadReferenceRegistry();
const hasReal = existsSync(referencesDir()) && real.files.length > 0;

test("EKTE DATA: lastes uten valideringsfeil", { skip: !hasReal && "ingen private referansefiler på denne maskinen" }, () => {
  assert.deepEqual(real.errors, []);
  assert.ok(real.records.length > 0);
});

test("EKTE DATA: alle poster er uverifiserte referanser med ukjent innhold", { skip: !hasReal && "ingen private referansefiler" }, () => {
  for (const r of real.records) {
    assert.equal(r.verificationStatus, "REFERENCE_UNVERIFIED", r.internalId);
    assert.equal(r.priceStatus, "REFERENCE_ONLY", r.internalId);
    assert.equal(r.inclusionStatus, "UNVERIFIED", r.internalId);
    assert.equal(r.vatBasis, "UNKNOWN", r.internalId);
    for (const f of ["includesLabor", "includesMaterials", "includesOverhead"] as const) {
      assert.equal(r[f], "UNKNOWN", `${r.internalId}.${f}`);
    }
    assert.equal(usableAsCustomerRate(r), false, r.internalId);
  }
});

test("EKTE DATA: koblinger peker på arbeidsposter som finnes, og ingen takterrasse sammenlignes med vanlig terrasse", { skip: !hasReal && "ingen private referansefiler" }, () => {
  for (const r of real.records) {
    for (const c of compareRecord(r, 1)) {
      assert.notEqual(c.status, "UNKNOWN_WORK_ITEM", `${r.internalId} → ${c.mapping.workItemKey}`);
      if (c.status === "COMPARED") assert.equal(c.model?.unit, r.unit);
    }
    if (/takterrasse|omvendt tak/i.test(r.description)) {
      for (const m of r.modelMappings) assert.equal(m.comparability, "NOT_COMPARABLE", r.internalId);
    }
  }
});
