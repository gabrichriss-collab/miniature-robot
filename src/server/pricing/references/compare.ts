import "server-only";
// Intern prisresearch. Skal ALDRI havne i nettleseren, i et offentlig
// API-svar eller i kundens PDF.

/**
 * SAMMENLIGNING — referansepriser mot vår egen modell.
 *
 * Våre tall hentes fra den EKTE motoren (calculateEstimate), aldri regnet
 * for hånd, slik at sammenligningen alltid speiler det kunden faktisk får.
 *
 * Reglene for å unngå feilslutninger:
 *  - Ulik enhet (m² mot lm mot stk) sammenlignes aldri.
 *  - NOT_COMPARABLE-koblinger gir ingen tall.
 *  - Ukjent mva-grunnlag vises med BEGGE tolkninger, aldri én.
 *  - Ukjent inkludering gir ingen "prosent avvik"-overskrift; forholdstall
 *    merkes som indikative.
 *  - En referansepris legges ALDRI oppå vår modell uten at guardene under
 *    har godkjent det (de sier i dag nei til alt med ukjent innhold).
 */

import { pricingSettings } from "../settings";
import { WORK_ITEMS, laborHoursForItem, type LaborItem } from "../labor";
import {
  getRecipe,
  TERRACE_CONSTRUCTIONS,
  TERRACE_FOUNDATIONS,
  type RecipeOptions
} from "../recipes";
import { MATERIALS } from "../materials";
import { calculateEstimate } from "../calculateEstimate";
import { PRICE_DB } from "../catalogue-source";
import {
  SCOPE_DIMENSIONS,
  type ModelMapping,
  type ReferencePriceRecord,
  type ScopeDimension,
  type ScopeMatrix,
  type ScopeValue,
  type TriState
} from "./types";

const r0 = (n: number) => Math.round(n);

/* ══════════════════ Vår modell ══════════════════ */

export type ModelFigures = {
  workItemKey: string;
  materialRecipeKey?: string;
  label: string;
  unit: string;
  quantity: number;
  /** Alle beløp eks. mva, fra calculateEstimate. */
  laborExVat: number;
  standard: { available: boolean; materialExVat: number; totalExVat: number; complete: boolean };
  premium: { available: boolean; materialExVat: number; totalExVat: number; complete: boolean };
  /** Arbeidsposten bevisst ikke prisbar (f.eks. nedforet himling). */
  laborPending: boolean;
};

/** Kjører den ekte motoren for én post. */
export function modelFigures(
  workItemKey: string,
  quantity: number,
  options: RecipeOptions = {},
  materialRecipeKey?: string
): ModelFigures | undefined {
  const item = (WORK_ITEMS as Record<string, LaborItem>)[workItemKey];
  if (!item) return undefined;
  const est = calculateEstimate([
    { workItemKey, materialRecipeKey, label: item.label, unit: item.unit, quantity, options }
  ]);
  const sc = (t: "standard" | "premium") => ({
    available: est.scenarios[t].available,
    materialExVat: r0(est.scenarios[t].materialExVat),
    totalExVat: r0(est.scenarios[t].subtotalExVat),
    complete: est.scenarios[t].materialEstimateComplete
  });
  return {
    workItemKey,
    materialRecipeKey,
    label: item.label,
    unit: item.unit,
    quantity,
    laborExVat: r0(est.labor.totalLaborExVat),
    standard: sc("standard"),
    premium: sc("premium"),
    laborPending: est.hasPendingLabor
  };
}

/**
 * Omfanget i VÅR terrassemodell, utledet fra oppskriftene der det går
 * (bæresystem, terrassebord, svinn) og fra dokumenterte regler ellers
 * (rekkverk, trapp, riving og fundament er egne poster — se
 * recipes.ts → terraceComplete.internalNote).
 */
export function ourTerraceScope(
  workItemKey: "terraceComplete" | "terraceDeckingOnly",
  options: RecipeOptions = {}
): ScopeMatrix {
  const recipe = getRecipe(workItemKey);
  const dyn = recipe?.dynamic?.(options);
  const std = [
    ...(recipe?.components ?? []),
    ...(recipe?.tiers?.standard ?? []),
    ...(dyn?.components ?? [])
  ];
  const usesMaterial = (pred: (id: string) => boolean) =>
    std.some((c) => pred(c.materialId));
  const hasFraming = usesMaterial((id) => id === "timber_48x148_imp");
  const hasDecking = usesMaterial((id) => MATERIALS[id]?.category === "Terrassebord");
  const construction = TERRACE_CONSTRUCTIONS[options.terraceConstruction ?? "standard"];
  const foundation = TERRACE_FOUNDATIONS[options.terraceFoundation ?? "existing"];
  const y = (value: TriState, basis: string): ScopeValue => ({ value, basis });

  return {
    constructionScope: y(
      "YES",
      workItemKey === "terraceComplete"
        ? `Komplett terrasse: bjelkelag + terrassebord (${construction.label})`
        : "Kun terrassebord på EKSISTERENDE bjelkelag"
    ),
    groundPreparation: y("NO", "Ingen terrassepost inkluderer grunnarbeid/avtaking av vekstjord"),
    structuralFramework: y(
      hasFraming ? "YES" : "NO",
      hasFraming
        ? `Oppskriften har 48×148 bjelkelag, ${construction.joistLmPerM2} lm/m²`
        : "Oppskriften har ikke bæresystem"
    ),
    foundations: y(
      "NO",
      foundation.note
        ? `Valgt «${foundation.label}» — navngitt, upriset post`
        : `Valgt «${foundation.label}» — ikke i prisen`
    ),
    deckingMaterial: y(
      hasDecking ? "YES" : "NO",
      hasDecking ? "Terrassebord i standard/premium-nivå (ikke i «kun arbeid»)" : "Ingen bordpost"
    ),
    railing: y("NO", "Egen post (terraceRailing), ikke i terrasseprisen"),
    stairs: y("NO", "Egen post (exteriorStairSimple), ikke i terrasseprisen"),
    demolition: y("NO", "Egen post (terraceDemolition), ikke i terrasseprisen"),
    waste: y("YES", "Svinn per material ligger i materialsummen (ikke i «kun arbeid»)"),
    vat: y("NO", "Alle modelltall er eks. mva; mva legges på én gang til slutt"),
    laborInclusion: y("YES", "Timer × timerate fra labor.ts / settings.ts"),
    materialsInclusion: y("UNKNOWN", "Avhenger av scenario: NO for «kun arbeid», YES for standard/premium"),
    insulation: y("NO", "Terrasse har ingen isolasjon")
  };
}

/** Omfanget for en referansepost: det som står i posten, ellers UNKNOWN. */
export function referenceScope(r: ReferencePriceRecord): ScopeMatrix {
  const out = {} as ScopeMatrix;
  for (const d of SCOPE_DIMENSIONS) {
    out[d] = r.scope?.[d] ?? { value: "UNKNOWN", basis: "Ikke oppgitt i kilden" };
  }
  // Disse tre er alltid knyttet til postens egne felter.
  out.laborInclusion = { value: r.includesLabor, basis: `includesLabor = ${r.includesLabor}` };
  out.materialsInclusion = { value: r.includesMaterials, basis: `includesMaterials = ${r.includesMaterials}` };
  out.vat = {
    value: r.vatBasis === "INC_VAT" ? "YES" : r.vatBasis === "EX_VAT" ? "NO" : "UNKNOWN",
    basis: `vatBasis = ${r.vatBasis}`
  };
  return out;
}

/* ══════════════════ Mva-tolkninger ══════════════════ */

export type VatReadings = {
  /** Beløpet slik kilden oppgir det, for gitt mengde. */
  asGiven: number;
  /** Eks. mva hvis kilden faktisk var inkl. mva (asGiven / 1,25). */
  exVatIfSourceIncVat: number;
  /** Hvilke(n) tolkning(er) som er gyldig(e) gitt vatBasis. */
  exVatCandidates: number[];
};

/** Mva håndteres ÉN gang: vi normaliserer kilden til eks. mva og stopper der. */
export function vatReadings(r: ReferencePriceRecord, quantity: number): VatReadings {
  const asGiven = r0(r.referencePriceNok * quantity);
  const exVatIfSourceIncVat = r0((r.referencePriceNok * quantity) / (1 + pricingSettings.vatRate));
  const exVatCandidates =
    r.vatBasis === "EX_VAT"
      ? [asGiven]
      : r.vatBasis === "INC_VAT"
        ? [exVatIfSourceIncVat]
        : [asGiven, exVatIfSourceIncVat];
  return { asGiven, exVatIfSourceIncVat, exVatCandidates };
}

/* ══════════════════ Dobbelttelling ══════════════════ */

export type CombinationVerdict = { allowed: boolean; reasons: string[] };

/**
 * Kan en referansepris legges OPPÅ vår modell for samme post?
 *
 * Regler (§7):
 *  - Inneholder (eller KAN inneholde) referansen arbeid → nei, ellers
 *    telles arbeidet to ganger.
 *  - Inneholder (eller kan inneholde) den materialer → nei, ellers telles
 *    f.eks. terrassebord eller isolasjon to ganger.
 *  - Ukjent mva-grunnlag → nei; mva skal legges på nøyaktig én gang.
 *  - Overlapper omfanget vårt (begge YES, eller referansen UNKNOWN der vi
 *    har YES) → nei.
 *  - Ukjent pris blir aldri 0 — ugyldige poster stoppes i valideringen.
 */
export function canAddReferenceOnTopOfModel(
  r: ReferencePriceRecord,
  model: ScopeMatrix
): CombinationVerdict {
  const reasons: string[] = [];
  if (r.includesLabor !== "NO") {
    reasons.push(`arbeid kan allerede være med (includesLabor = ${r.includesLabor}) — ville gitt dobbelt arbeid`);
  }
  if (r.includesMaterials !== "NO") {
    reasons.push(`materialer kan allerede være med (includesMaterials = ${r.includesMaterials}) — ville gitt dobbelt materialer`);
  }
  if (r.vatBasis === "UNKNOWN") {
    reasons.push("ukjent mva-grunnlag — mva kan ikke legges på nøyaktig én gang");
  }
  const ref = referenceScope(r);
  for (const d of SCOPE_DIMENSIONS) {
    if (d === "vat" || d === "laborInclusion" || d === "materialsInclusion") continue;
    if (model[d].value === "YES" && ref[d].value !== "NO") {
      reasons.push(`${d}: finnes i vår modell, og referansen har ${ref[d].value} — mulig dobbelttelling`);
    }
  }
  return { allowed: reasons.length === 0, reasons };
}

/**
 * Kan flere referanseposter brukes SAMMEN? Nei hvis to av dem dekker
 * samme omfang — f.eks. to poster som begge tar av vekstjord.
 */
export function detectReferenceOverlaps(records: ReferencePriceRecord[]): string[] {
  const issues: string[] = [];
  const checked: ScopeDimension[] = [
    "groundPreparation",
    "structuralFramework",
    "foundations",
    "deckingMaterial",
    "railing",
    "stairs",
    "demolition",
    "insulation"
  ];
  for (const d of checked) {
    const holders = records.filter((r) => referenceScope(r)[d].value === "YES");
    if (holders.length > 1) {
      issues.push(`${d} dekkes av flere poster: ${holders.map((h) => h.internalId).join(", ")}`);
    }
  }
  return issues;
}

/* ══════════════════ Sammenligning per post ══════════════════ */

export type MappingComparison = {
  mapping: ModelMapping;
  status: "COMPARED" | "UNIT_MISMATCH" | "NOT_COMPARABLE" | "UNKNOWN_WORK_ITEM" | "LABOR_NOT_PRICEABLE";
  note: string;
  quantity: number;
  model?: ModelFigures;
  reference?: VatReadings;
  /**
   * Referansens eks. mva-kandidater delt på vår sum. INDIKATIVT — omfang
   * og inkludering er ikke verifisert, så dette er ikke "% for dyrt".
   */
  indicativeRatios?: Array<{ against: string; ratios: number[] }>;
  combination?: CombinationVerdict;
};

export function compareRecord(
  r: ReferencePriceRecord,
  quantity = 1,
  defaultOptions: RecipeOptions = {}
): MappingComparison[] {
  return r.modelMappings.map((mapping) => {
    const options = { ...defaultOptions, ...(mapping.options as RecipeOptions | undefined) };
    const base = { mapping, quantity };
    const item = (WORK_ITEMS as Record<string, LaborItem>)[mapping.workItemKey];
    if (!item) {
      return { ...base, status: "UNKNOWN_WORK_ITEM", note: `Ingen arbeidspost ${mapping.workItemKey}` };
    }
    if (mapping.comparability === "NOT_COMPARABLE") {
      return { ...base, status: "NOT_COMPARABLE", note: mapping.reason };
    }
    if (item.unit !== r.unit) {
      return {
        ...base,
        status: "UNIT_MISMATCH",
        note: `Referansen er per ${r.unit}, vår post per ${item.unit} — sammenlignes ikke`
      };
    }
    if (laborHoursForItem(mapping.workItemKey) == null) {
      return { ...base, status: "LABOR_NOT_PRICEABLE", note: "Arbeidsposten kan ikke prises i vår modell" };
    }
    const model = modelFigures(mapping.workItemKey, quantity, options, mapping.materialRecipeKey)!;
    const reference = vatReadings(r, quantity);
    const ratio = (ours: number) =>
      reference.exVatCandidates.map((c) => (ours > 0 ? Math.round((c / ours) * 100) / 100 : NaN));
    const indicativeRatios = [
      { against: "kun arbeid", ratios: ratio(model.laborExVat) },
      ...(model.standard.available
        ? [{
            against: `arbeid + standard materialer${model.standard.complete ? "" : " (UFULLSTENDIG materialsum)"}`,
            ratios: ratio(model.standard.totalExVat)
          }]
        : []),
      ...(model.premium.available
        ? [{
            against: `arbeid + premium materialer${model.premium.complete ? "" : " (UFULLSTENDIG materialsum)"}`,
            ratios: ratio(model.premium.totalExVat)
          }]
        : [])
    ];
    const ourScope =
      mapping.workItemKey === "terraceComplete" || mapping.workItemKey === "terraceDeckingOnly"
        ? ourTerraceScope(mapping.workItemKey, options)
        : undefined;
    return {
      ...base,
      status: "COMPARED",
      note: mapping.reason,
      model,
      reference,
      indicativeRatios,
      combination: ourScope ? canAddReferenceOnTopOfModel(r, ourScope) : undefined
    };
  });
}

/* ══════════════════ 36 m² terrasse ══════════════════ */

export type TerraceComparison = {
  areaM2: number;
  options: RecipeOptions;
  ours: Array<{ key: "terraceComplete" | "terraceDeckingOnly"; figures: ModelFigures; scope: ScopeMatrix }>;
  references: Array<{ record: ReferencePriceRecord; scope: ScopeMatrix; comparisons: MappingComparison[] }>;
};

export const STANDARD_TERRACE_OPTIONS: RecipeOptions = {
  terraceConstruction: "standard",
  terraceFastening: "visible",
  terraceFoundation: "existing"
};

export function terraceComparison(
  records: ReferencePriceRecord[],
  areaM2 = 36,
  options: RecipeOptions = STANDARD_TERRACE_OPTIONS
): TerraceComparison {
  const ours = (["terraceComplete", "terraceDeckingOnly"] as const).map((key) => ({
    key,
    figures: modelFigures(key, areaM2, options)!,
    scope: ourTerraceScope(key, options)
  }));
  const references = records
    // Bare m²-poster: rekkverk (lm) hører ikke hjemme i en m²-sammenligning.
    .filter((r) => r.category === "TERRACE_OUTDOOR" && r.unit === "m²")
    .map((record) => ({
      record,
      scope: referenceScope(record),
      comparisons: compareRecord(record, areaM2, options)
    }));
  return { areaM2, options, ours, references };
}

/* ══════════════════ Dekning (§6) ══════════════════ */

/**
 * Arbeidstypene eier har bedt oss sjekke. `workItemKeys` er våre
 * kandidater; `catalogueHints` er ord som finnes i katalognavnene.
 * Ingen referansedata her — bare vår egen modell.
 */
export const REQUESTED_WORK_TYPES: Array<{
  label: string;
  workItemKeys: string[];
  catalogueHints: string[];
}> = [
  { label: "Standard terrasse", workItemKeys: ["terraceComplete"], catalogueHints: ["Bygging av terrasse"] },
  { label: "Utskifting av terrassebord", workItemKeys: ["terraceDeckingOnly"], catalogueHints: ["Terrassebord"] },
  { label: "Rekkverk terrasse", workItemKeys: ["terraceRailing"], catalogueHints: ["Rekkverk"] },
  { label: "Levegg", workItemKeys: ["privacyScreen"], catalogueHints: ["Levegg"] },
  { label: "Takrehabilitering", workItemKeys: [], catalogueHints: ["Riving av tak", "Nye takstoler"] },
  { label: "Ny taktekking", workItemKeys: [], catalogueHints: ["Taktekking"] },
  { label: "Utskifting av takvindu", workItemKeys: [], catalogueHints: ["Takvindu"] },
  { label: "Utvendig kledning", workItemKeys: ["timberCladding", "facadeComplete"], catalogueHints: ["kledning"] },
  { label: "Etterisolering fasade", workItemKeys: ["exteriorInsulation", "facadeComplete"], catalogueHints: ["Etterisolering + ny kledning", "Etterisolering fasade"] },
  { label: "Innvendig skillevegg", workItemKeys: ["interiorPartitionWall"], catalogueHints: ["Letvegg", "skillevegg"] },
  { label: "Hulltaking for dør i eksisterende vegg", workItemKeys: [], catalogueHints: ["Hulltaking", "dør i vegg"] },
  { label: "Himling", workItemKeys: ["ceilingWork"], catalogueHints: ["Himling"] },
  { label: "Isolering av tak / loft", workItemKeys: [], catalogueHints: ["Etterisolering tak", "Etterisolering loft"] }
];

export type CoverageRow = {
  label: string;
  workItems: Array<{ key: string; unit: string; laborPriceable: boolean; recipeStatus: string }>;
  catalogue: Array<{ name: string; unit: string; mapped: boolean }>;
  /** AUTO = kunden får beregnet pris i dag; PARTIAL = arbeid, ikke komplett materialer; ASSESS = etter befaring. */
  customerOutcome: "AUTO" | "PARTIAL" | "ASSESS" | "MISSING";
};

export function coverageTable(): CoverageRow[] {
  return REQUESTED_WORK_TYPES.map((t) => {
    const workItems = t.workItemKeys.map((key) => {
      const item = (WORK_ITEMS as Record<string, LaborItem>)[key];
      return {
        key,
        unit: item?.unit ?? "?",
        laborPriceable: laborHoursForItem(key) != null,
        recipeStatus: getRecipe(key)?.status ?? "mangler"
      };
    });
    const catalogue = PRICE_DB.filter(
      (e) =>
        t.catalogueHints.some((h) => e.name.toLowerCase().includes(h.toLowerCase())) ||
        (e.workItemKey != null && t.workItemKeys.includes(e.workItemKey))
    ).map((e) => ({
      name: e.name,
      unit: e.unit,
      mapped: e.workItemKey != null && laborHoursForItem(e.workItemKey) != null
    }));
    const anyPriceable = workItems.some((w) => w.laborPriceable) && catalogue.some((c) => c.mapped);
    const anyMaterials = workItems.some((w) => ["complete", "assumed"].includes(w.recipeStatus));
    const customerOutcome: CoverageRow["customerOutcome"] = anyPriceable
      ? anyMaterials
        ? "AUTO"
        : "PARTIAL"
      : catalogue.length > 0
        ? "ASSESS"
        : "MISSING";
    return { label: t.label, workItems, catalogue, customerOutcome };
  });
}
