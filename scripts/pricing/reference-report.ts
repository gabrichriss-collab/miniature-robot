/**
 * INTERN RAPPORT — referansepriser mot vår modell.
 *
 *   npm run pricing:references
 *
 * Leser de gitignorerte referansefilene, kjører sammenligningene mot den
 * ekte prismotoren og skriver rapporten til
 * private/pricing-references/reports/ (også gitignorert). Rapporten
 * inneholder lisensierte tall og skal ikke committes eller publiseres.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadReferenceRegistry, referencesDir, usableAsCustomerRate } from "../../src/server/pricing/references/registry";
import {
  compareRecord,
  coverageTable,
  detectReferenceOverlaps,
  referenceScope,
  terraceComparison,
  type MappingComparison
} from "../../src/server/pricing/references/compare";
import { SCOPE_DIMENSIONS, type ReferencePriceRecord } from "../../src/server/pricing/references/types";

const nok = (n: number) => `${Math.round(n).toLocaleString("nb-NO").replace(/ /g, " ")} kr`;
const out: string[] = [];
const p = (s = "") => out.push(s);

const reg = loadReferenceRegistry();
p("# Referansepriser — intern sammenligning (Trinn A)");
p();
p(`Mappe: \`${referencesDir()}\` · filer: ${reg.files.join(", ") || "(ingen)"} · poster: ${reg.records.length}`);
if (reg.errors.length) {
  p();
  p("## Valideringsfeil");
  reg.errors.forEach((e) => p(`- ${e}`));
}
p();
p(`Kan brukes som kundesats: ${reg.records.filter(usableAsCustomerRate).length} av ${reg.records.length}.`);

/* ── Poster som må avklares ── */
p();
p("## Poster som må avklares");
p();
p("| ID | Kode | Variant | Beskrivelse | Enhet | Pris | Fagvurdering | Merknad |");
p("|---|---|---|---|---|---|---|---|");
for (const r of reg.records) {
  p(
    `| ${r.internalId} | ${r.sourceCode} | ${r.sourceVariant ?? "—"}${r.sourceVariantIsLocal ? " (lokal)" : ""} | ${r.description} | ${r.unit} | ${nok(r.referencePriceNok)} | ${r.requiresProfessionalAssessment ? "ja" : "nei"} | ${r.notes || "—"} |`
  );
}

/* ── 36 m² terrasse ── */
const tc = terraceComparison(reg.records, 36);
p();
p(`## ${tc.areaM2} m² terrasse (normal konstruksjon, synlig innfesting, eksisterende fundament)`);
p();
p("### Vår modell (fra calculateEstimate, eks. mva)");
p();
p("| Post | Kun arbeid | Std. materialer | Arbeid + std. | Premium materialer | Arbeid + premium | Materialer komplette |");
p("|---|---|---|---|---|---|---|");
for (const o of tc.ours) {
  const f = o.figures;
  p(
    `| ${f.label} | ${nok(f.laborExVat)} | ${nok(f.standard.materialExVat)} | ${nok(f.standard.totalExVat)} | ${
      f.premium.available ? nok(f.premium.materialExVat) : "—"
    } | ${f.premium.available ? nok(f.premium.totalExVat) : "—"} | std: ${f.standard.complete ? "ja" : "nei"}${
      f.premium.available ? `, prem: ${f.premium.complete ? "ja" : "nei"}` : ""
    } |`
  );
}

const cmpRow = (r: ReferencePriceRecord, c: MappingComparison) => {
  if (c.status !== "COMPARED" || !c.reference || !c.model) {
    return `| ${r.description} | ${c.mapping.workItemKey} | ${c.status} | — | — | ${c.note} |`;
  }
  const ratios = (c.indicativeRatios ?? [])
    .map((x) => `${x.against}: ${x.ratios.map((v) => v.toFixed(2)).join(" / ")}`)
    .join("; ");
  return `| ${r.description} | ${c.mapping.workItemKey}${c.mapping.materialRecipeKey ? ` (${c.mapping.materialRecipeKey})` : ""} | ${c.mapping.comparability} | ${nok(c.reference.asGiven)} | ${nok(c.reference.exVatIfSourceIncVat)} | ${ratios} |`;
};

p();
p("### Referanser på samme 36 m²-grunnlag");
p();
p("Mva-grunnlaget er ukjent, så hver referanse vises med begge tolkninger. Forholdstall = referanse eks. mva ÷ vår sum (først «som oppgitt», så «÷1,25»). **Indikativt — omfang og inkludering er ikke verifisert.**");
p();
p("| Referanse | Vår post | Sammenlignbarhet | Som oppgitt | Hvis inkl. mva → eks. | Forholdstall (indikativt) |");
p("|---|---|---|---|---|---|");
for (const ref of tc.references) for (const c of ref.comparisons) p(cmpRow(ref.record, c));

p();
p("### Omfangsmatrise");
p();
const heads = [
  "Dimensjon",
  ...tc.ours.map((o) => `Vår: ${o.key}`),
  ...tc.references.map((r) => r.record.description)
];
p(`| ${heads.join(" | ")} |`);
p(`|${heads.map(() => "---").join("|")}|`);
for (const d of SCOPE_DIMENSIONS) {
  p(
    `| ${d} | ${[
      ...tc.ours.map((o) => `${o.scope[d].value} — ${o.scope[d].basis}`),
      ...tc.references.map((r) => `${r.scope[d].value}${r.scope[d].value !== "UNKNOWN" ? ` — ${r.scope[d].basis}` : ""}`)
    ].join(" | ")} |`
  );
}

p();
p("### Kan en referanse legges oppå vår terrasse?");
p();
for (const ref of tc.references) {
  for (const c of ref.comparisons) {
    if (!c.combination) continue;
    p(`- **${ref.record.description}** → ${c.mapping.workItemKey}: ${c.combination.allowed ? "tillatt" : "NEI"}`);
    c.combination.reasons.forEach((x) => p(`  - ${x}`));
  }
}

p();
p("### Overlapp hvis referansepostene summeres");
p();
p("Postene er alternativer for samme flate og skal ikke legges sammen; dette viser hva som ville blitt telt dobbelt.");
p();
const overlaps = detectReferenceOverlaps(tc.references.map((r) => r.record));
if (overlaps.length === 0) p("Ingen.");
overlaps.forEach((o) => p(`- ${o}`));

/* ── Øvrige koblinger ── */
p();
p("## Øvrige koblinger (per enhet)");
p();
p("| Referanse | Vår post | Sammenlignbarhet | Som oppgitt | Hvis inkl. mva → eks. | Forholdstall (indikativt) |");
p("|---|---|---|---|---|---|");
for (const r of reg.records.filter((x) => x.category !== "TERRACE_OUTDOOR" || x.unit !== "m²")) {
  if (r.modelMappings.length === 0) {
    p(`| ${r.description} | — | ingen kobling | — | — | Ingen tilsvarende post i vår modell |`);
    continue;
  }
  for (const c of compareRecord(r, 1)) p(cmpRow(r, c));
}

/* ── Dekning ── */
p();
p("## Dekning av etterspurte arbeidstyper (§6, generert fra modellen)");
p();
p("| Arbeidstype | Våre arbeidsposter | Katalogposter | Kundeutfall i dag |");
p("|---|---|---|---|");
for (const row of coverageTable()) {
  p(
    `| ${row.label} | ${row.workItems.map((w) => `${w.key} (${w.unit}; arbeid ${w.laborPriceable ? "ja" : "nei"}; materialer ${w.recipeStatus})`).join("<br>") || "—"} | ${
      row.catalogue.map((c) => `${c.name} (${c.unit}${c.mapped ? "" : ", ikke kartlagt"})`).join("<br>") || "—"
    } | ${row.customerOutcome} |`
  );
}

/* ── Referansescope uten kobling (kontroll) ── */
const unmappedWithScope = reg.records.filter(
  (r) => r.modelMappings.length === 0 && SCOPE_DIMENSIONS.some((d) => referenceScope(r)[d].value === "YES")
);
if (unmappedWithScope.length) {
  p();
  p(`Poster med kjent omfang men uten kobling: ${unmappedWithScope.map((r) => r.internalId).join(", ")}`);
}

const dir = join(referencesDir(), "reports");
mkdirSync(dir, { recursive: true });
const file = join(dir, "trinn-a-sammenligning.md");
writeFileSync(file, out.join("\n") + "\n");
console.log(out.join("\n"));
console.error(`\nSkrevet til ${file}`);
