"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PRICE_DB,
  UNITS,
  NEEDS_SURVEY,
  VAT_PERCENT,
  DEFAULT_MARKUP_PERCENT,
  type PriceEntry
} from "@/data/pricing";
import { findBestMatch } from "@/lib/fuzzyMatch";
import Link from "next/link";
import {
  calcTotals,
  formatNok,
  laborLinesForRows,
  materialLinesForRows,
  HOURLY_RATE_EX_VAT,
  VAT_RATE,
  type EstimateRow,
  type EstimateInput,
  type EstimateTotals
} from "@/lib/estimateCalc";
import { formatHours, formatQty } from "@/lib/pricing/format";
import { laborHoursForItem } from "@/config/pricing";
import {
  DIFFICULTY_LABELS,
  ESTIMATE_DISCLAIMER,
  ESTIMATE_DISCLAIMER_CLOSING,
  MATERIAL_TIER_LABELS,
  MATERIALS_LAST_UPDATED,
  TERRACE_CONSTRUCTIONS,
  TERRACE_CONSTRUCTION_ORDER,
  TERRACE_FASTENINGS,
  TERRACE_FASTENING_ORDER,
  TERRACE_FOUNDATIONS,
  TERRACE_FOUNDATION_ORDER,
  TERRACE_STRUCTURAL_CAVEAT,
  TERRACE_WORK_ITEMS,
  CEILING_TYPES,
  CEILING_TYPE_ORDER,
  PARTITION_SCOPES,
  PARTITION_SCOPE_ORDER,
  INSULATION_OPTIONS,
  INSULATION_OPTION_ORDER,
  type DifficultyKey,
  type MaterialTier
} from "@/config/pricing";

/**
 * Prisestimat-bygger — line-item verktøy i tråd med hvordan norske
 * håndverkere bygger tilbud i Svenn/Cordel/EG SmartKalk. Utseendet matcher
 * TØMRER KAWICHE sitt design (bone, ink, Sorts Mill Goudy).
 */
export default function PrisestimatBuilder() {
  const [rows, setRows] = useState<EstimateRow[]>([]);
  const [projectName, setProjectName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPostal, setCustomerPostal] = useState("");
  const [message, setMessage] = useState("");
  const [mvaRate] = useState(VAT_PERCENT);
  const [markup] = useState(DEFAULT_MARKUP_PERCENT);
  const [materialTier, setMaterialTier] = useState<MaterialTier>("none");
  const [showSummary, setShowSummary] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  const addEmptyRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: "",
        unit: "m²",
        qty: "",
        price: "",
        note: "",
        matched: false,
        matchName: ""
      }
    ]);
  }, []);

  const addFromDB = useCallback((entry: PriceEntry) => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: entry.name,
        unit: entry.unit,
        qty: "",
        price: entry.price,
        note: entry.note ?? "",
        matched: true,
        matchName: entry.name,
        workItemKey: entry.workItemKey,
        materialRecipeKey: entry.materialRecipeKey,
        difficulty: "normal"
      }
    ]);
    setShowBrowse(false);
  }, []);

  const updateRow = useCallback(
    (id: EstimateRow["id"], field: keyof EstimateRow, value: string) => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const updated: EstimateRow = { ...r, [field]: value };
          if (field === "name") {
            if (value.length >= 2) {
              const match = findBestMatch(value);
              if (match && match.name !== r.matchName) {
                updated.price = match.price;
                updated.unit = match.unit;
                updated.note = match.note ?? "";
                updated.matched = true;
                updated.matchName = match.name;
                updated.workItemKey = match.workItemKey;
                updated.materialRecipeKey = match.materialRecipeKey;
                updated.difficulty = updated.difficulty ?? "normal";
              }
            } else {
              updated.matched = false;
              updated.matchName = "";
              updated.workItemKey = undefined;
              updated.materialRecipeKey = undefined;
            }
          }
          return updated;
        })
      );
    },
    []
  );

  const deleteRow = useCallback((id: EstimateRow["id"]) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const input: EstimateInput = useMemo(
    () => ({
      projectName,
      customerName,
      customerEmail,
      customerPhone,
      customerPostal,
      message,
      rows,
      mvaRate,
      markup,
      materialTier
    }),
    [
      projectName,
      customerName,
      customerEmail,
      customerPhone,
      customerPostal,
      message,
      rows,
      mvaRate,
      markup,
      materialTier
    ]
  );

  const totals = useMemo(() => calcTotals(input), [input]);

  const canSubmit = rows.length > 0 && customerName && customerEmail;

  const downloadPdf = useCallback(async () => {
    setSending(true);
    setFeedback("");
    try {
      const res = await fetch("/api/prisestimat/pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (projectName || "prisestimat")
        .replace(/[^a-z0-9æøå\-_ ]/gi, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
      a.download = `prisestimat-${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setFeedback("PDF lastet ned. Vi har også fått en kopi.");
    } catch (err) {
      setFeedback("Kunne ikke generere PDF. Prøv igjen eller ta kontakt direkte.");
    } finally {
      setSending(false);
    }
  }, [input, projectName]);

  return (
    <div className="mx-auto max-w-[var(--page-max)] px-6 pb-40 md:px-10">
      <div className="rule mb-14" />

      {/* Customer + project block */}
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow text-ink/60">Prosjekt</p>
          <h2 className="headline mt-4 text-3xl md:text-4xl">
            Bygg estimatet linje for linje.
          </h2>
          <p className="mt-6 max-w-sm text-ink/75">
            Skriv hva som skal gjøres — for eksempel <em>«terrasse 36 m²»</em>{" "}
            — så finner vi riktig post og beregner arbeidstiden. Du kan også
            bla i prislista. Nederst velger du om estimatet skal gjelde kun
            arbeid, eller arbeid med materialer.
          </p>
        </div>

        <div className="md:col-span-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label="Prosjektnavn"
              placeholder="F.eks. Tilbygg Uglåsvegen"
              value={projectName}
              onChange={setProjectName}
            />
            <Field
              label="Navn *"
              placeholder="Ditt navn"
              value={customerName}
              onChange={setCustomerName}
              required
            />
            <Field
              label="E-post *"
              type="email"
              placeholder="deg@epost.no"
              value={customerEmail}
              onChange={setCustomerEmail}
              required
            />
            <Field
              label="Telefon"
              type="tel"
              placeholder="+47 ..."
              value={customerPhone}
              onChange={setCustomerPhone}
            />
            <Field
              label="Postnummer"
              placeholder="5957"
              value={customerPostal}
              onChange={setCustomerPostal}
            />
            <Field
              label="Litt om prosjektet"
              placeholder="Beskrivelse, plassering, tidsplan"
              value={message}
              onChange={setMessage}
            />
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="mt-16 flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow text-ink/60">
          {rows.length === 0
            ? "Legg til første post"
            : `${rows.length} ${rows.length === 1 ? "post" : "poster"}`}
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setShowBrowse(true)}
            className="eyebrow border border-ink/40 px-5 py-3 transition-colors hover:bg-ink hover:text-bone"
          >
            Bla i prisliste →
          </button>
          <button
            type="button"
            onClick={addEmptyRow}
            className="eyebrow border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-bone"
          >
            + Ny post
          </button>
        </div>
      </div>

      {/* Rows table */}
      {rows.length === 0 ? (
        <div className="mt-10 border-y border-ink/10 py-20 text-center">
          <p className="headline text-3xl md:text-4xl">
            Bare begynn å skrive.
          </p>
          <p className="mt-4 max-w-md mx-auto text-ink/70">
            Skriv en beskrivelse i første post — <em>«terrasse 36 m²»</em>,{" "}
            <em>«nytt vindu»</em>, <em>«ny kledning»</em> — så tar vi resten.
          </p>
        </div>
      ) : (
        <div className="mt-10 border-y border-ink/15">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[minmax(0,1fr)_4.5rem_5rem_6rem_7rem_2rem] items-center gap-3 border-b border-ink/10 py-3 lg:grid-cols-[minmax(0,1fr)_5rem_6rem_7rem_8rem_2.5rem] lg:gap-4">
            <span className="eyebrow text-ink/50">Hva skal gjøres</span>
            <span className="eyebrow text-ink/50 text-center">Enhet</span>
            <span className="eyebrow text-ink/50 text-right">Mengde</span>
            <span className="eyebrow text-ink/50 text-right">Timer</span>
            <span className="eyebrow text-ink/50 text-right">Arbeid</span>
            <span aria-hidden />
          </div>

          {rows.map((row, i) => (
            <RowItem
              key={row.id}
              row={row}
              index={i}
              updateRow={updateRow}
              deleteRow={deleteRow}
            />
          ))}
        </div>
      )}

      {/* Prisestimat — arbeid vs. arbeid + materialer */}
      {rows.length > 0 && (
        <EstimatePanel
          rows={rows}
          input={input}
          totals={totals}
          materialTier={materialTier}
          onSelectTier={setMaterialTier}
          projectName={projectName}
          canSubmit={Boolean(canSubmit)}
          sending={sending}
          feedback={feedback}
          onDownload={downloadPdf}
          onShowSummary={() => setShowSummary(true)}
        />
      )}

      {/* Modals */}
      {showBrowse && (
        <BrowseModal
          onSelect={addFromDB}
          onClose={() => setShowBrowse(false)}
        />
      )}
      {showSummary && (
        <SummaryModal
          input={input}
          totals={totals}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}


/* ─────────────────── Prisestimat-panel ─────────────────── */

const TIER_ORDER: MaterialTier[] = ["none", "standard", "premium"];

/**
 * Sammenligningen kunden faktisk leser: KUN ARBEID mot ARBEID +
 * MATERIALER. Kortene ER velgeren — man trykker på det nivået man vil se,
 * i stedet for å måtte forholde seg til både radioknapper og en tabell.
 * Stables i én kolonne på mobil.
 */
function EstimatePanel({
  rows,
  input,
  totals,
  materialTier,
  onSelectTier,
  projectName,
  canSubmit,
  sending,
  feedback,
  onDownload,
  onShowSummary
}: {
  rows: EstimateRow[];
  input: EstimateInput;
  totals: EstimateTotals;
  materialTier: MaterialTier;
  onSelectTier: (t: MaterialTier) => void;
  projectName: string;
  canSubmit: boolean;
  sending: boolean;
  feedback: string;
  onDownload: () => void;
  onShowSummary: () => void;
}) {
  const { estimate } = totals;
  const visibleTiers = TIER_ORDER.filter(
    (t) => estimate.scenarios[t].available
  );
  const active = estimate.scenarios[totals.materialTier];
  const materialLines = materialLinesForRows(rows, totals.materialTier);
  const laborLines = laborLinesForRows(rows);
  const hasTerraceLine = rows.some(
    (r) =>
      (TERRACE_WORK_ITEMS as readonly string[]).includes(
        String(r.workItemKey)
      ) && Number(r.qty) > 0
  );

  return (
    <div className="mt-14 grid gap-10 md:grid-cols-12">
      <div className="md:col-span-4">
        <p className="eyebrow text-ink/60">Ditt prisestimat</p>
        <h2 className="headline mt-4 text-3xl md:text-4xl">
          Hva vil det koste?
        </h2>
        <p className="mt-6 max-w-sm text-sm text-ink/70">
          Arbeidet er regnet ut fra{" "}
          {formatHours(totals.laborHours)} arbeidstimer ×{" "}
          {formatNok(HOURLY_RATE_EX_VAT)} kr/time eks. mva. Materialene
          regnes hver for seg, med veiledende norske referansepriser.
        </p>
      </div>

      <div className="md:col-span-8">
        {/* Materialvalg — kortene er velgeren */}
        <fieldset>
          <legend className="eyebrow mb-4 text-ink/60">Materialer</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTiers.map((tier) => {
              const s = estimate.scenarios[tier];
              const selected = tier === totals.materialTier;
              const incomplete = tier !== "none" && !s.materialEstimateComplete;
              return (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectTier(tier)}
                  className={`press border p-5 text-left transition-colors duration-300 ease-swoop ${
                    selected
                      ? "border-ink bg-ink text-bone"
                      : "border-ink/20 text-ink hover:border-ink/50"
                  }`}
                >
                  <span
                    className={`eyebrow block ${
                      selected ? "text-bone/70" : "text-ink/60"
                    }`}
                  >
                    {s.label}
                  </span>
                  {/* Privatkunder betaler inkl. mva, så det tallet står
                      størst. «Fra» når noe er upriset — summen er et
                      minimum, ikke et ferdig sammenligningstall. */}
                  <span className="headline mt-4 block text-2xl md:text-3xl">
                    {incomplete ? "Fra " : ""}
                    {formatNok(s.totalIncVat)} kr
                  </span>
                  <span
                    className={`mt-1 block text-xs ${
                      selected ? "text-bone/70" : "text-ink/60"
                    }`}
                  >
                    inkl. mva
                  </span>
                  <span
                    className={`mt-3 block text-sm ${
                      selected ? "text-bone/85" : "text-ink/75"
                    }`}
                  >
                    {incomplete ? "Fra " : ""}
                    {formatNok(s.subtotalExVat)} kr eks. mva
                  </span>
                  {/* REGEL: en ufullstendig materialkurv skal aldri kunne
                      leses som en ferdig materialpris. */}
                  {tier !== "none" && !s.materialEstimateComplete ? (
                    <span
                      className={`mt-3 block text-xs ${
                        selected ? "text-bone/70" : "text-ink/55"
                      }`}
                    >
                      {s.materialExVat > 0
                        ? "Delvis materialestimat — minstesum, deler av materialene må avklares"
                        : "Materialpris må avklares"}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        {!estimate.materialsAvailable ? (
          <p className="mt-4 border-l-2 border-ink/25 pl-4 text-sm text-ink/70">
            For postene du har lagt inn beregner vi arbeidet nå.
            Materialkostnaden avklares etter valgt produkt og konstruksjon.
          </p>
        ) : null}

        {/* Veiledende spenn for valgt nivå */}
        <div className="mt-8 border-t border-ink pt-6">
          <p className="eyebrow mb-2 text-ink/60">
            Veiledende estimat · {active.label}
            {totals.materialTier !== "none" && !active.materialEstimateComplete
              ? " · delvis materialestimat"
              : ""}
          </p>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <span className="headline text-3xl md:text-5xl">
              {formatNok(totals.range.low)}
              <span className="text-ink/40"> – </span>
              {formatNok(totals.range.high)} kr
            </span>
            <span className="text-sm text-ink/60">inkl. mva</span>
          </div>
        </div>

        {/* Poster vi bevisst ikke priser */}
        {estimate.hasPendingLabor ? (
          <p className="mt-4 border-l-2 border-ink/25 pl-4 text-sm text-ink/70">
            En eller flere poster kan ikke beregnes automatisk ennå og er
            ikke med i summen. De er merket i lista over.
          </p>
        ) : null}

        {estimate.unpricedMaterials.length > 0 &&
        totals.materialTier !== "none" ? (
          <div className="mt-6 border border-dashed border-ink/20 p-4 text-sm text-ink/70">
            <p className="eyebrow mb-2 text-ink/60">Avklares separat</p>
            <ul className="space-y-1">
              {estimate.unpricedMaterials.map((u) => (
                <li key={u.workItemKey}>
                  <span className="font-medium text-ink/85">{u.label}</span> —{" "}
                  {u.note}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Detaljert beregning */}
        {totals.laborHours > 0 && (
          <details className="mt-8 border border-ink/15">
            <summary className="cursor-pointer px-4 py-3 eyebrow text-ink/70">
              Se beregning
            </summary>
            <div className="space-y-8 border-t border-ink/10 p-4 text-sm text-ink/75 md:p-6">
              {/* ARBEID */}
              <section>
                <p className="eyebrow mb-3 text-ink/60">Arbeid</p>
                {laborLines.map((l) => (
                  <BreakdownRow
                    key={`labor-${l.workItemKey}-${l.label}`}
                    left={
                      <>
                        {l.label}
                        <span className="block text-xs text-ink/55">
                          {formatQty(l.quantity)} {l.unit} ×{" "}
                          {formatHours(l.laborHoursPerUnit)} t/{l.unit}
                          {l.difficultyFactor !== 1
                            ? ` × ${l.difficultyFactor} (${DIFFICULTY_LABELS[l.difficulty]})`
                            : ""}{" "}
                          = {formatHours(l.totalLaborHours)} timer
                        </span>
                      </>
                    }
                    right={`${formatNok(l.laborPriceExVat)} kr`}
                  />
                ))}
                <BreakdownRow
                  emphasis
                  left={`${formatHours(totals.laborHours)} timer × ${formatNok(
                    HOURLY_RATE_EX_VAT
                  )} kr/time`}
                  right={`${formatNok(totals.laborExVat)} kr eks. mva`}
                />
              </section>

              {/* MATERIALER */}
              {totals.materialTier !== "none" ? (
                <section>
                  <p className="eyebrow mb-3 text-ink/60">Materialer</p>
                  {materialLines
                    .filter((m) => m.components.length > 0)
                    .map((m) => (
                      <div key={`mat-${m.workItemKey}`} className="mb-4">
                        <p className="text-ink/85">{m.label}</p>
                        {m.components.map((c) => (
                          <BreakdownRow
                            key={`${m.workItemKey}-${c.materialId}`}
                            left={
                              <>
                                {c.name}
                                <span className="block text-xs text-ink/55">
                                  {formatQty(c.grossQuantity)} {c.unit} ×{" "}
                                  {c.referencePriceExVat.toLocaleString("nb-NO", {
                                    maximumFractionDigits: 2
                                  })}{" "}
                                  kr/{c.unit} eks. mva
                                  {c.assumption ? ` · ${c.assumption}` : ""}
                                </span>
                              </>
                            }
                            right={`${formatNok(c.totalCostExVat)} kr`}
                          />
                        ))}
                        {m.pending.length > 0 ? (
                          <p className="mt-2 text-xs text-ink/55">
                            Ikke medregnet:{" "}
                            {m.pending.map((p) => p.label).join(", ")} —
                            avklares ved befaring.
                          </p>
                        ) : null}
                      </div>
                    ))}
                  <BreakdownRow
                    left="Herav materialsvinn"
                    right={`${formatNok(totals.materialWasteExVat)} kr`}
                  />
                  <BreakdownRow
                    left="Herav materialpris-buffer"
                    right={`${formatNok(totals.materialProtectionExVat)} kr`}
                  />
                  {totals.materialSmallConsumablesExVat > 0 ? (
                    <BreakdownRow
                      left="Småforbruk"
                      right={`${formatNok(
                        totals.materialSmallConsumablesExVat
                      )} kr`}
                    />
                  ) : null}
                  <BreakdownRow
                    emphasis
                    left="Sum materialer"
                    right={`${formatNok(totals.materialExVat)} kr eks. mva`}
                  />
                  {hasTerraceLine ? (
                    <p className="mt-3 text-xs text-ink/55">
                      {TERRACE_STRUCTURAL_CAVEAT}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-ink/55">
                    Materialprisene er veiledende norske referansepriser per{" "}
                    {MATERIALS_LAST_UPDATED}, bevisst satt konservativt slik at
                    estimatet ikke havner for lavt. Svinn og prisreserve er
                    regnet med.
                  </p>
                </section>
              ) : null}

              {/* TOTALT */}
              <section className="border-t border-ink/20 pt-4">
                <BreakdownRow
                  left="Sum eks. mva"
                  right={`${formatNok(totals.subtotal)} kr`}
                />
                <BreakdownRow
                  left={`MVA (${Math.round(VAT_RATE * 100)} %)`}
                  right={`${formatNok(totals.mvaAmount)} kr`}
                />
                <BreakdownRow
                  emphasis
                  left="Totalt inkl. mva"
                  right={`${formatNok(totals.total)} kr`}
                />
              </section>
            </div>
          </details>
        )}

        {/* Forbehold */}
        <p className="mt-8 max-w-2xl border-l-2 border-ink/30 pl-4 text-sm text-ink/70">
          <strong className="font-semibold">
            Veiledende prisestimat — ikke bindende tilbud.
          </strong>{" "}
          {ESTIMATE_DISCLAIMER} {ESTIMATE_DISCLAIMER_CLOSING}
        </p>

        {/* Videre til henvendelse — alt regnestykket sendes med */}
        <div className="mt-10 border border-ink/20 p-6 md:p-8">
          <p className="eyebrow mb-3 text-ink/60">Neste steg</p>
          <p className="headline text-2xl md:text-3xl">
            Vil du at vi vurderer prosjektet nærmere?
          </p>
          <p className="mt-3 max-w-xl text-ink/75">
            Vi tar gjerne en befaring — gratis og uforpliktende. Prosjektet du
            har skissert her sendes med, slik at du ikke trenger å skrive det
            inn på nytt.
          </p>
          <Link
            href={`/kontakt?type=tilbud&tjeneste=${encodeURIComponent(
              projectName || "Prisestimat"
            )}&melding=${encodeURIComponent(
              buildEnquiryPrefill({ input, totals })
            )}`}
            className="group mt-6 inline-flex items-center gap-3 border border-ink bg-ink px-7 py-4 eyebrow text-bone press hover:bg-transparent hover:text-ink"
          >
            Be om befaring
            <span
              aria-hidden
              className="transition-transform duration-500 ease-swoop group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        {/* Last ned / sammendrag */}
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <button
            type="button"
            disabled={!canSubmit || sending}
            onClick={onDownload}
            className="group inline-flex items-center gap-4 border border-ink bg-ink px-8 py-5 eyebrow text-bone press hover:bg-transparent hover:text-ink disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-bone"
          >
            {sending ? "Genererer PDF…" : "Last ned prisestimat"}
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              ↓
            </span>
          </button>
          <button
            type="button"
            onClick={onShowSummary}
            className="uline eyebrow inline-flex min-h-[44px] items-center"
          >
            Se sammendrag →
          </button>
        </div>

        {!canSubmit && (
          <p className="mt-4 text-sm text-ink/60">
            Fyll inn navn og e-post for å laste ned — da får både du og vi en
            kopi.
          </p>
        )}
        {feedback && <p className="mt-4 text-sm text-ink/70">{feedback}</p>}
      </div>
    </div>
  );
}

function BreakdownRow({
  left,
  right,
  emphasis
}: {
  left: React.ReactNode;
  right: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_auto] gap-4 py-2 ${
        emphasis
          ? "mt-2 border-t border-ink/15 pt-3 text-ink/90"
          : "border-b border-ink/5"
      }`}
    >
      <span className={emphasis ? "font-medium" : ""}>{left}</span>
      <span className="whitespace-nowrap tabular-nums">{right}</span>
    </div>
  );
}

/* ─────────────────────────── Row ─────────────────────────── */

function RowItem({
  row,
  index,
  updateRow,
  deleteRow
}: {
  row: EstimateRow;
  index: number;
  updateRow: (id: EstimateRow["id"], field: keyof EstimateRow, value: string) => void;
  deleteRow: (id: EstimateRow["id"]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Labor-engine rows compute rowTotal from hours × rate × difficulty;
  // legacy rows still fall back to qty × price.
  const laborLine = row.workItemKey
    ? laborLinesForRows([row])[0]
    : undefined;
  const rowTotal = laborLine
    ? laborLine.laborPriceExVat
    : (parseFloat(String(row.qty)) || 0) * (parseFloat(String(row.price)) || 0);

  // Bæresystem og fundamentering avhenger av terrassetype, så valget
  // følger med til befaringen selv om vi ikke priser det ennå.
  const isTerraceItem = (TERRACE_WORK_ITEMS as readonly string[]).includes(
    String(row.workItemKey)
  );

  useEffect(() => {
    if (!row.name && inputRef.current) inputRef.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`row-enter grid grid-cols-1 gap-y-6 py-8 md:grid-cols-[minmax(0,1fr)_4.5rem_5rem_6rem_7rem_2rem] md:items-center md:gap-3 md:gap-y-2 md:py-5 lg:grid-cols-[minmax(0,1fr)_5rem_6rem_7rem_8rem_2.5rem] lg:gap-4 ${
        index !== 0 ? "border-t border-ink/10" : ""
      }`}
    >
      <div className="min-w-0">
        <input
          ref={inputRef}
          className="min-h-[48px] w-full border-b border-ink/20 bg-transparent py-2 text-base text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none md:text-lg"
          placeholder="Skriv hva som skal gjøres…"
          value={row.name}
          onChange={(e) => updateRow(row.id, "name", e.target.value)}
        />
        {row.matched && row.matchName ? (
          // Mobil: «Auto» står på egen linje, så beskrivelsen får hele
          // bredden og brytes naturlig. Desktop beholder én linje.
          <div className="match-badge mt-3 text-ink/60">
            <span className="eyebrow block text-[0.6rem] text-ink/70 md:mr-2 md:inline md:text-[0.72rem]">
              Auto
            </span>
            <p className="mt-1 text-sm leading-relaxed md:mt-0 md:inline md:text-xs">
              {row.matchName}
              {laborLine ? (
                <span className="text-ink/50">
                  {" · "}
                  {formatHours(laborLine.laborHoursPerUnit)} t/{laborLine.unit}
                </span>
              ) : null}
              {row.note ? (
                <span className="text-ink/50">{` · ${row.note}`}</span>
              ) : null}
            </p>
          </div>
        ) : null}
        {row.workItemKey ? (
          <div className="mt-5 md:mt-2">
            <RowSelect
              label="Tilkomst"
              value={row.difficulty ?? "normal"}
              onChange={(v) => updateRow(row.id, "difficulty", v)}
              options={(Object.keys(DIFFICULTY_LABELS) as DifficultyKey[]).map(
                (k) => [k, DIFFICULTY_LABELS[k]]
              )}
            />
          </div>
        ) : null}
        {isTerraceItem ? (
          <div className="mt-5 grid gap-5 md:mt-2 md:flex md:flex-wrap md:gap-x-5 md:gap-y-2">
            <RowSelect
              label="Konstruksjon"
              value={row.terraceConstruction ?? "standard"}
              onChange={(v) => updateRow(row.id, "terraceConstruction", v)}
              options={TERRACE_CONSTRUCTION_ORDER.map((k) => [
                k,
                TERRACE_CONSTRUCTIONS[k].label
              ])}
            />
            <RowSelect
              label="Innfesting"
              value={row.terraceFastening ?? "visible"}
              onChange={(v) => updateRow(row.id, "terraceFastening", v)}
              options={TERRACE_FASTENING_ORDER.map((k) => [
                k,
                TERRACE_FASTENINGS[k].label
              ])}
            />
            <RowSelect
              label="Fundament"
              value={row.terraceFoundation ?? "existing"}
              onChange={(v) => updateRow(row.id, "terraceFoundation", v)}
              options={TERRACE_FOUNDATION_ORDER.map((k) => [
                k,
                TERRACE_FOUNDATIONS[k].label
              ])}
            />
          </div>
        ) : null}
        {row.workItemKey === "ceilingWork" ? (
          <div className="mt-5 grid gap-5 md:mt-2 md:flex md:flex-wrap md:gap-x-5 md:gap-y-2">
            <RowSelect
              label="Himlingstype"
              value={row.ceilingType ?? "direct"}
              onChange={(v) => updateRow(row.id, "ceilingType", v)}
              options={CEILING_TYPE_ORDER.map((k) => [k, CEILING_TYPES[k].label])}
            />
          </div>
        ) : null}
        {row.workItemKey === "interiorPartitionWall" ? (
          <div className="mt-5 grid gap-5 md:mt-2 md:flex md:flex-wrap md:gap-x-5 md:gap-y-2">
            <RowSelect
              label="Omfang"
              value={row.partitionScope ?? "complete"}
              onChange={(v) => updateRow(row.id, "partitionScope", v)}
              options={PARTITION_SCOPE_ORDER.map((k) => [
                k,
                PARTITION_SCOPES[k].label
              ])}
            />
          </div>
        ) : null}
        {row.workItemKey === "facadeComplete" ||
        row.workItemKey === "exteriorInsulation" ? (
          <div className="mt-5 grid gap-5 md:mt-2 md:flex md:flex-wrap md:gap-x-5 md:gap-y-2">
            <RowSelect
              label="Etterisolering"
              value={
                row.facadeInsulation ??
                (row.workItemKey === "exteriorInsulation" ? "mm100" : "none")
              }
              onChange={(v) => updateRow(row.id, "facadeInsulation", v)}
              options={INSULATION_OPTION_ORDER.map((k) => [
                k,
                INSULATION_OPTIONS[k].label
              ])}
            />
          </div>
        ) : null}
        {laborLine?.laborPending && laborLine.pendingNote ? (
          <p className="mt-2 text-xs text-ink/60">{laborLine.pendingNote}</p>
        ) : null}
      </div>

      {/* Mengde og enhet hører sammen. På mobil vises de som ÉN gruppe med
          felles etikett — tallet er hovedsaken, enheten står til høyre og
          er visuelt underordnet. På md+ løses grupperingen opp (`contents`)
          slik at feltene faller tilbake i rutenettet som før. */}
      <div className="md:contents">
        <span className="eyebrow mb-2 block text-ink/50 md:hidden">Mengde</span>
        {/* flex-row-reverse: DOM-rekkefølgen beholdes for desktop-rutenettet,
            mens tallet likevel står først visuelt på mobil. */}
        <div className="flex flex-row-reverse md:contents">
          <select
            className="field-control field-select press w-24 shrink-0 border-l-0 text-center md:w-auto md:border md:border-ink/20 md:px-2 md:py-2 md:text-center"
            value={row.unit}
            onChange={(e) => updateRow(row.id, "unit", e.target.value)}
            aria-label="Enhet"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <input
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            className="field-control press min-w-0 flex-1 text-left text-lg md:flex-none md:border md:border-ink/20 md:px-3 md:py-2 md:text-right md:text-[0.78rem]"
            placeholder="0"
            value={row.qty}
            onChange={(e) => updateRow(row.id, "qty", e.target.value)}
            aria-label="Mengde"
          />
        </div>
      </div>

      {laborLine ? (
        <div className="md:contents">
          <span className="eyebrow mb-1 block text-ink/50 md:hidden">
            Estimert arbeidstid
          </span>
          <div
            className="text-ink/70 md:px-2 md:py-2 md:text-right md:text-sm md:text-ink/60"
            title="Beregnet arbeidstid per enhet"
          >
            {formatHours(laborLine.laborHoursPerUnit)} t/{row.unit}
            {/* Totalen for raden er nyttig på mobil, men overflødig i
                rutenettet på desktop der den har egen kolonne. */}
            <span className="md:hidden">
              {" · "}
              {formatHours(laborLine.totalLaborHours)} timer
            </span>
          </div>
        </div>
      ) : (
        <div className="md:contents">
          <span className="eyebrow mb-2 block text-ink/50 md:hidden">
            Enhetspris
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            className="field-control press text-right"
            placeholder="0"
            value={row.price}
            onChange={(e) => updateRow(row.id, "price", e.target.value)}
            aria-label="Enhetspris"
          />
        </div>
      )}

      <div className="md:contents">
        <span className="eyebrow mb-1 block text-ink/50 md:hidden">
          Estimert arbeid
        </span>
        <div className="text-right text-base font-medium text-ink md:text-lg">
          <span className="float-left md:hidden">
            {rowTotal > 0 ? (
              <span className="text-xl">{formatNok(rowTotal)} kr</span>
            ) : (
              "—"
            )}
            <span className="ml-2 text-xs font-normal text-ink/55">
              eks. mva
            </span>
          </span>
          <span className="hidden md:inline">
            {rowTotal > 0 ? `${formatNok(rowTotal)} kr` : "—"}
          </span>
        </div>
      </div>

      {/* Synlig ikon holdes lite, men trykkflaten er minst 44 px. */}
      <button
        type="button"
        onClick={() => deleteRow(row.id)}
        aria-label="Fjern post"
        className="press mt-1 flex min-h-[44px] min-w-[44px] items-center justify-end gap-2 self-end text-ink/45 transition-colors hover:text-ink md:mt-0 md:justify-self-end"
      >
        <span className="eyebrow text-[0.6rem] md:hidden">Fjern</span>
        <span aria-hidden className="text-xl leading-none">
          ×
        </span>
      </button>
    </div>
  );
}

function RowSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    // Mobil: etiketten står OVER feltet, og feltet får hele bredden.
    // Lange norske verdier skal aldri klemmes inn ved siden av etiketten.
    // md+: tilbake til den kompakte varianten på én linje.
    <label className="block md:flex md:items-center md:gap-2 md:text-xs md:text-ink/60">
      <span className="eyebrow mb-2 block text-ink/50 md:mb-0 md:inline">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-control field-select press"
        aria-label={label}
      >
        {options.map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ─────────────────────────── Fields ─────────────────────────── */

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-ink/60">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 min-h-[48px] w-full border-b border-ink/30 bg-transparent py-3 text-lg placeholder:text-ink/40 focus:border-ink focus:outline-none"
        placeholder={placeholder}
      />
    </label>
  );
}

function TotalLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <dt className="text-ink/70">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

/* ─────────────────────────── Modals ─────────────────────────── */

function ModalShell({
  onClose,
  title,
  children
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<"open" | "closed">("open");

  const requestClose = useCallback(() => {
    setState("closed");
    window.setTimeout(onClose, 240);
  }, [onClose]);

  return (
    <div
      data-modal-backdrop
      data-state={state}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      onClick={requestClose}
    >
      <div
        data-modal-panel
        data-state={state}
        className="max-h-[85vh] w-full max-w-3xl overflow-auto bg-bone shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-bone px-6 py-5 md:px-10">
          <p className="eyebrow">{title}</p>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Lukk"
            className="text-2xl text-ink/50 hover:text-ink"
          >
            ×
          </button>
        </header>
        <div className="px-6 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}

function BrowseModal({
  onSelect,
  onClose
}: {
  onSelect: (entry: PriceEntry) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const catsMap = useMemo(() => {
    const map: Record<string, PriceEntry[]> = {};
    PRICE_DB.forEach((e) => {
      (map[e.cat] ??= []).push(e);
    });
    return map;
  }, []);

  const filtered =
    search.length >= 2
      ? PRICE_DB.filter(
          (e) =>
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.keywords.some((k) =>
              k.toLowerCase().includes(search.toLowerCase())
            )
        )
      : null;

  return (
    <ModalShell onClose={onClose} title="Prisliste">
      <input
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Søk i prisliste — f.eks. «vindu», «terrasse», «tak»…"
        className="w-full border-b border-ink/30 bg-transparent py-3 text-lg focus:border-ink focus:outline-none"
      />

      <div className="mt-8 space-y-10">
        {filtered ? (
          filtered.length === 0 ? (
            <p className="py-8 text-center text-ink/60">Ingen treff.</p>
          ) : (
            <ul className="grid gap-3">
              {filtered.map((e) => (
                <PriceRow key={e.name} entry={e} onSelect={onSelect} />
              ))}
            </ul>
          )
        ) : (
          Object.entries(catsMap).map(([cat, entries]) => (
            <section key={cat}>
              <h3 className="headline text-2xl mb-4">{cat}</h3>
              <ul className="grid gap-3">
                {entries.map((e) => (
                  <PriceRow key={e.name} entry={e} onSelect={onSelect} />
                ))}
              </ul>
            </section>
          ))
        )}

        {/* Needs-survey placeholder cards */}
        <section>
          <h3 className="headline text-2xl mb-4">Etter befaring</h3>
          <ul className="grid gap-3">
            {NEEDS_SURVEY.map((n) => (
              <li
                key={n.label}
                className="border-l-2 border-ink/30 py-3 pl-4 text-ink/80"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium">{n.label}</span>
                  <a
                    className="uline eyebrow text-xs"
                    href="/kontakt"
                  >
                    Book befaring →
                  </a>
                </div>
                <p className="mt-1 text-sm text-ink/60">{n.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ModalShell>
  );
}

function PriceRow({
  entry,
  onSelect
}: {
  entry: PriceEntry;
  onSelect: (e: PriceEntry) => void;
}) {
  // Den gamle kr/enhet-prisen brukes ikke i beregningen — vi viser
  // arbeidstimene motoren faktisk regner med.
  const hours = entry.workItemKey
    ? laborHoursForItem(entry.workItemKey)
    : undefined;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(entry)}
        className="flex w-full items-baseline justify-between gap-4 border-b border-ink/10 py-3 text-left transition-colors hover:bg-ink/[0.03]"
      >
        <span>
          <span className="text-base font-medium text-ink">{entry.name}</span>
          {entry.note ? (
            <span className="ml-3 text-sm text-ink/60">{entry.note}</span>
          ) : null}
        </span>
        <span className="eyebrow whitespace-nowrap text-ink/80">
          {hours != null
            ? `${formatHours(hours)} t / ${entry.unit}`
            : "Ved befaring"}
        </span>
      </button>
    </li>
  );
}

function SummaryModal({
  input,
  totals,
  onClose
}: {
  input: EstimateInput;
  totals: ReturnType<typeof calcTotals>;
  onClose: () => void;
}) {
  const summaryLabor = new Map(
    laborLinesForRows(input.rows).map((l) => [l.label, l])
  );
  return (
    <ModalShell
      onClose={onClose}
      title={`Sammendrag · ${input.projectName || "Uten navn"}`}
    >
      {input.customerName ? (
        <p className="mb-6 text-sm text-ink/70">
          Kunde: <span className="font-medium">{input.customerName}</span>
          {input.customerEmail ? ` · ${input.customerEmail}` : ""}
        </p>
      ) : null}

      {input.rows.length === 0 ? (
        <p className="py-8 text-center text-ink/60">Ingen poster.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-ink/20">
              <th className="eyebrow py-3 text-left text-ink/60">Beskrivelse</th>
              <th className="eyebrow py-3 text-right text-ink/60">Mengde</th>
              <th className="eyebrow py-3 text-right text-ink/60">Timer</th>
              <th className="eyebrow py-3 text-right text-ink/60">Arbeid</th>
            </tr>
          </thead>
          <tbody>
            {input.rows.map((r) => {
              const l = summaryLabor.get(r.matchName || r.name);
              const legacy =
                (parseFloat(String(r.qty)) || 0) *
                (parseFloat(String(r.price)) || 0);
              return (
                <tr key={r.id} className="border-b border-ink/10">
                  <td className="py-3">
                    <div className="font-medium">{r.name || "—"}</div>
                    {r.note ? (
                      <div className="text-xs text-ink/60">{r.note}</div>
                    ) : null}
                  </td>
                  <td className="py-3 text-right text-sm text-ink/70">
                    {r.qty || "—"} {r.unit}
                  </td>
                  <td className="py-3 text-right text-sm text-ink/70">
                    {l ? `${formatHours(l.totalLaborHours)} t` : "—"}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {l
                      ? `${formatNok(l.laborPriceExVat)} kr`
                      : legacy > 0
                        ? `${formatNok(legacy)} kr`
                        : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="mt-8 grid gap-2 border-t border-ink/20 pt-6">
        <TotalLine
          label="Arbeid (eks. mva)"
          value={`${formatNok(totals.laborExVat + totals.legacyExVat)} kr`}
        />
        <TotalLine
          label={`Materialer — ${MATERIAL_TIER_LABELS[totals.materialTier]}`}
          value={
            totals.materialTier === "none"
              ? "ikke medregnet"
              : `${formatNok(totals.materialExVat)} kr`
          }
        />
        <TotalLine
          label={`MVA (${input.mvaRate}%)`}
          value={`${formatNok(totals.mvaAmount)} kr`}
        />
        <div className="mt-4 flex items-baseline justify-between border-t border-ink pt-4">
          <span className="eyebrow">Totalt</span>
          <span className="headline text-3xl md:text-4xl">
            {formatNok(totals.total)} kr
          </span>
        </div>
      </div>
    </ModalShell>
  );
}

/**
 * Bygger meldingsteksten som sendes videre til kontaktskjemaet, slik at
 * kunden aldri må skrive inn det samme to ganger. Alt som er valgt i
 * kalkulatoren følger med: poster, mengder, enheter, tilkomst,
 * terrassekonstruksjon, materialvalg, arbeid, materialer, mva og totalen.
 */
function buildEnquiryPrefill({
  input,
  totals
}: {
  input: EstimateInput;
  totals: EstimateTotals;
}): string {
  const lines: string[] = [];
  if (input.projectName) lines.push(`Prosjekt: ${input.projectName}`);
  if (input.customerPostal) lines.push(`Postnummer: ${input.customerPostal}`);
  lines.push("");

  lines.push("Poster fra prisestimatet:");
  const labor = laborLinesForRows(input.rows);
  const laborByLabel = new Map(labor.map((l) => [l.label, l]));
  for (const r of input.rows) {
    if (!r.name) continue;
    const qty = String(r.qty || "");
    const label = r.matchName || r.name;
    const l = laborByLabel.get(label);
    if (l) {
      const diff =
        r.difficulty && r.difficulty !== "normal"
          ? ` (${DIFFICULTY_LABELS[r.difficulty as DifficultyKey]})`
          : "";
      const construction = (
        TERRACE_WORK_ITEMS as readonly string[]
      ).includes(String(r.workItemKey))
        ? ` [${
            TERRACE_CONSTRUCTIONS[r.terraceConstruction ?? "standard"].label
          } · ${TERRACE_FASTENINGS[r.terraceFastening ?? "visible"].label} · ${
            TERRACE_FOUNDATIONS[r.terraceFoundation ?? "existing"].label
          }]`
        : "";
      lines.push(
        `• ${label}${diff}${construction} — ${qty} ${r.unit} × ${formatHours(
          l.laborHoursPerUnit
        )} t/${r.unit} = ${formatHours(l.totalLaborHours)} t`
      );
    } else {
      const price = String(r.price || "");
      lines.push(
        `• ${r.name}${qty ? ` — ${qty} ${r.unit}` : ""}${
          price ? ` @ ${price} kr/${r.unit}` : ""
        }`
      );
    }
  }
  lines.push("");

  lines.push(`Materialvalg: ${MATERIAL_TIER_LABELS[totals.materialTier]}`);
  if (totals.estimate.hasPendingLabor) {
    lines.push(
      "MERK: én eller flere poster kunne ikke beregnes automatisk og er " +
        "ikke med i summen."
    );
  }
  if (totals.laborHours > 0) {
    lines.push(`Sum arbeidstimer: ${formatHours(totals.laborHours)} t`);
  }
  lines.push(
    `Arbeid: ${formatNok(totals.laborExVat + totals.legacyExVat)} kr eks. mva`
  );
  if (totals.materialTier !== "none") {
    lines.push(`Materialer: ${formatNok(totals.materialExVat)} kr eks. mva`);
    if (!totals.materialEstimateComplete) {
      lines.push(
        "  MERK: delvis materialestimat — deler av materialene er ikke " +
          "medregnet og avklares ved befaring."
      );
    }
  }
  lines.push(`Sum eks. mva: ${formatNok(totals.subtotal)} kr`);
  lines.push(
    `MVA (${Math.round(VAT_RATE * 100)} %): ${formatNok(totals.mvaAmount)} kr`
  );
  lines.push(`Totalt inkl. mva: ${formatNok(totals.total)} kr`);
  lines.push(
    `Veiledende spenn: ${formatNok(totals.range.low)} – ${formatNok(
      totals.range.high
    )} kr inkl. mva`
  );

  const unpriced = totals.estimate.unpricedMaterials;
  if (unpriced.length > 0) {
    lines.push("");
    lines.push("Avklares separat:");
    for (const u of unpriced) lines.push(`• ${u.label} — ${u.note}`);
  }

  lines.push("");
  lines.push(ESTIMATE_DISCLAIMER_CLOSING);

  if (input.message) {
    lines.push("");
    lines.push(input.message);
  }
  return lines.join("\n");
}
