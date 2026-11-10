import "server-only";
// Intern prisresearch. Skal ALDRI havne i nettleseren, i et offentlig
// API-svar eller i kundens PDF.

/**
 * REFERANSEPRIS-REGISTERET — innlasting og validering.
 *
 * HVOR DATAENE LIGGER
 * Repoet er offentlig. Referansepriser fra tredjepart er lisensierte og
 * skal ikke publiseres, så selve postene ligger i en GITIGNORERT mappe:
 *
 *   private/pricing-references/*.json
 *
 * (kan overstyres med miljøvariabelen PRICING_REFERENCES_DIR).
 * Mangler mappen, returnerer registeret en tom liste — ingenting
 * kundevendt avhenger av den.
 *
 * Registeret er bevisst IKKE eksportert fra src/server/pricing/index.ts,
 * slik at ingen del av prismotoren, API-et eller UI-et kan plukke det opp
 * ved et uhell. Bare interne skript og tester importerer det direkte.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  COMPARABILITIES,
  INCLUSION_STATUSES,
  PRICE_STATUSES,
  REFERENCE_CATEGORIES,
  REFERENCE_SOURCES,
  REFERENCE_UNITS,
  SCOPE_DIMENSIONS,
  TRI_STATES,
  VAT_BASES,
  VERIFICATION_STATUSES,
  type ReferenceFile,
  type ReferencePriceRecord
} from "./types";

/** Standardmappe, relativt til prosjektroten. Gitignorert. */
export const DEFAULT_REFERENCES_DIR = "private/pricing-references";

export function referencesDir(): string {
  return resolve(process.env.PRICING_REFERENCES_DIR ?? DEFAULT_REFERENCES_DIR);
}

/* ── Validering ─────────────────────────────────────────────────── */

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

const oneOf = (list: readonly string[], v: unknown) =>
  typeof v === "string" && list.includes(v);

/**
 * Sjekker én post. Returnerer en liste med feil — tom liste = gyldig.
 * Kaster aldri, slik at en rapport kan vise ALLE feil på én gang.
 */
export function validateRecord(r: unknown, where = "post"): string[] {
  const errors: string[] = [];
  if (typeof r !== "object" || r === null) return [`${where}: ikke et objekt`];
  const x = r as Record<string, unknown>;
  const need = (cond: boolean, msg: string) => {
    if (!cond) errors.push(`${where} (${String(x.internalId ?? "?")}): ${msg}`);
  };

  need(typeof x.internalId === "string" && x.internalId.length > 0, "internalId mangler");
  need(oneOf(REFERENCE_SOURCES, x.source), "ukjent source");
  need(typeof x.sourceCode === "string" && x.sourceCode.length > 0, "sourceCode mangler");
  need(x.sourceVariant === null || typeof x.sourceVariant === "string", "sourceVariant må være tekst eller null");
  need(typeof x.sourceVariantIsLocal === "boolean", "sourceVariantIsLocal må være boolsk");
  need(typeof x.description === "string" && x.description.length > 0, "description mangler");
  need(oneOf(REFERENCE_CATEGORIES, x.category), "ukjent category");
  need(oneOf(REFERENCE_UNITS, x.unit), "ukjent unit");
  need(
    typeof x.referencePriceNok === "number" &&
      Number.isFinite(x.referencePriceNok) &&
      x.referencePriceNok > 0,
    "referencePriceNok må være et positivt tall"
  );
  need(oneOf(VAT_BASES, x.vatBasis), "ukjent vatBasis");
  need(typeof x.capturedDate === "string" && isoDate.test(x.capturedDate), "capturedDate må være ISO-dato");
  need(oneOf(INCLUSION_STATUSES, x.inclusionStatus), "ukjent inclusionStatus");
  for (const f of ["includesLabor", "includesMaterials", "includesOverhead"]) {
    need(oneOf(TRI_STATES, x[f]), `${f} må være YES, NO eller UNKNOWN`);
  }
  need(oneOf(PRICE_STATUSES, x.priceStatus), "ukjent priceStatus");
  need(oneOf(VERIFICATION_STATUSES, x.verificationStatus), "ukjent verificationStatus");
  need(Array.isArray(x.applicableConditions), "applicableConditions må være en liste");
  need(Array.isArray(x.excludedWork), "excludedWork må være en liste");
  need(typeof x.requiresProfessionalAssessment === "boolean", "requiresProfessionalAssessment må være boolsk");
  need(typeof x.evidence === "string" && x.evidence.length > 0, "evidence mangler");
  need(x.reviewedBy === null || typeof x.reviewedBy === "string", "reviewedBy må være tekst eller null");
  need(
    x.reviewedAt === null || (typeof x.reviewedAt === "string" && isoDate.test(x.reviewedAt)),
    "reviewedAt må være ISO-dato eller null"
  );
  need(typeof x.notes === "string", "notes må være tekst");

  // Uverifisert inkludering kan ikke samtidig påstå at noe inngår.
  if (x.inclusionStatus === "UNVERIFIED") {
    for (const f of ["includesLabor", "includesMaterials", "includesOverhead"]) {
      need(x[f] === "UNKNOWN", `${f} kan ikke være ${String(x[f])} når inkluderingen er uverifisert`);
    }
  }
  // Ukjent mva-grunnlag + verifisert post er selvmotsigende.
  if (x.verificationStatus === "REFERENCE_VERIFIED") {
    need(x.vatBasis !== "UNKNOWN", "verifisert post kan ikke ha ukjent mva-grunnlag");
    need(x.inclusionStatus === "VERIFIED", "verifisert post må ha verifisert inkludering");
    need(x.reviewedBy != null && x.reviewedAt != null, "verifisert post må ha reviewedBy og reviewedAt");
  }

  if (!Array.isArray(x.modelMappings)) {
    need(false, "modelMappings må være en liste");
  } else {
    x.modelMappings.forEach((m, i) => {
      const mm = m as Record<string, unknown>;
      need(typeof mm?.workItemKey === "string", `modelMappings[${i}].workItemKey mangler`);
      need(oneOf(COMPARABILITIES, mm?.comparability), `modelMappings[${i}].comparability ukjent`);
      need(typeof mm?.reason === "string" && mm.reason.length > 0, `modelMappings[${i}].reason mangler`);
      need(
        mm?.options === undefined ||
          (typeof mm.options === "object" &&
            mm.options !== null &&
            Object.values(mm.options).every((v) => typeof v === "string")),
        `modelMappings[${i}].options må være et objekt med tekstverdier`
      );
    });
  }

  if (x.scope !== undefined) {
    if (typeof x.scope !== "object" || x.scope === null) {
      need(false, "scope må være et objekt");
    } else {
      for (const [k, v] of Object.entries(x.scope)) {
        need((SCOPE_DIMENSIONS as readonly string[]).includes(k), `scope.${k} er ikke en kjent dimensjon`);
        const sv = v as Record<string, unknown>;
        need(oneOf(TRI_STATES, sv?.value), `scope.${k}.value må være YES, NO eller UNKNOWN`);
        need(typeof sv?.basis === "string" && sv.basis.length > 0, `scope.${k}.basis mangler`);
      }
    }
  }
  return errors;
}

/**
 * Sjekker hele registeret: hver post, unike ID-er, og at poster som
 * deler elementkode har hver sin variant-ID.
 */
export function validateRegistry(records: unknown[]): string[] {
  const errors = records.flatMap((r, i) => validateRecord(r, `post ${i + 1}`));
  const valid = records.filter((r) => validateRecord(r).length === 0) as ReferencePriceRecord[];

  const ids = new Map<string, number>();
  for (const r of valid) ids.set(r.internalId, (ids.get(r.internalId) ?? 0) + 1);
  for (const [id, n] of ids) if (n > 1) errors.push(`internalId ${id} finnes ${n} ganger`);

  const byCode = new Map<string, ReferencePriceRecord[]>();
  for (const r of valid) {
    const k = `${r.source}|${r.sourceCode}`;
    byCode.set(k, [...(byCode.get(k) ?? []), r]);
  }
  for (const [k, group] of byCode) {
    if (group.length < 2) continue;
    const variants = group.map((r) => r.sourceVariant);
    if (variants.some((v) => v == null)) {
      errors.push(`${k}: flere poster deler elementkode, men minst én mangler sourceVariant`);
    } else if (new Set(variants).size !== variants.length) {
      errors.push(`${k}: flere poster har samme sourceVariant`);
    }
  }
  return errors;
}

/* ── Bruksvakt ──────────────────────────────────────────────────── */

/**
 * Kan denne referanseprisen brukes direkte som kundesats?
 *
 * Svaret er bevisst strengt — og i dag i praksis alltid NEI. Også en
 * VALIDATED post skal inn i vår egen modell (labor.ts / materials.ts)
 * med egne timer og egne materialpriser; registeret er ikke en prisliste.
 * Funksjonen finnes slik at all kode som noen gang vurderer å bruke en
 * referansepris, må gå gjennom ett sted som sier nei.
 */
export function usableAsCustomerRate(r: ReferencePriceRecord): boolean {
  return (
    r.priceStatus === "VALIDATED" &&
    r.verificationStatus === "REFERENCE_VERIFIED" &&
    r.inclusionStatus === "VERIFIED" &&
    r.vatBasis !== "UNKNOWN" &&
    r.includesLabor !== "UNKNOWN" &&
    r.includesMaterials !== "UNKNOWN" &&
    r.includesOverhead !== "UNKNOWN" &&
    !r.requiresProfessionalAssessment &&
    r.reviewedBy != null &&
    r.reviewedAt != null
  );
}

/* ── Innlasting ─────────────────────────────────────────────────── */

export type LoadResult = {
  records: ReferencePriceRecord[];
  /** Filene som ble lest. Tom når mappen mangler. */
  files: string[];
  errors: string[];
};

/** Leser én fil. Kaster ikke — feil havner i `errors`. */
export function parseReferenceFile(text: string, name: string): LoadResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { records: [], files: [name], errors: [`${name}: ugyldig JSON`] };
  }
  const f = data as Partial<ReferenceFile>;
  if (f?.schemaVersion !== 1 || !Array.isArray(f.records)) {
    return { records: [], files: [name], errors: [`${name}: mangler schemaVersion 1 eller records`] };
  }
  const errors = validateRegistry(f.records).map((e) => `${name}: ${e}`);
  return {
    records: errors.length === 0 ? (f.records as ReferencePriceRecord[]) : [],
    files: [name],
    errors
  };
}

/**
 * Leser alle *.json i referansemappen. En fil med feil lastes IKKE
 * (alt-eller-ingenting per fil), slik at halvvalide data aldri brukes.
 */
export function loadReferenceRegistry(dir = referencesDir()): LoadResult {
  if (!existsSync(dir)) return { records: [], files: [], errors: [] };
  const names = readdirSync(dir)
    .filter((n) => n.endsWith(".json") && !n.endsWith(".example.json"))
    .sort();
  const out: LoadResult = { records: [], files: [], errors: [] };
  for (const n of names) {
    const r = parseReferenceFile(readFileSync(join(dir, n), "utf8"), n);
    out.records.push(...r.records);
    out.files.push(...r.files);
    out.errors.push(...r.errors);
  }
  // ID-er må være unike på tvers av filer også.
  out.errors.push(...validateRegistry(out.records).filter((e) => e.startsWith("internalId")));
  return out;
}
