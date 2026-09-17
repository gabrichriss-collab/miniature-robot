"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { findBestMatch } from "@/lib/fuzzyMatch";
import { formatNok, formatQty } from "@/lib/pricing/format";
import {
  CEILING_TYPE_LABELS,
  CEILING_TYPE_ORDER,
  CEILING_WORK_ITEM,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  ESTIMATE_DISCLAIMER,
  ESTIMATE_DISCLAIMER_CLOSING,
  INSULATION_OPTION_LABELS,
  INSULATION_OPTION_ORDER,
  MATERIAL_TIER_LABELS,
  PARTITION_SCOPE_LABELS,
  PARTITION_SCOPE_ORDER,
  TERRACE_CONSTRUCTION_LABELS,
  TERRACE_CONSTRUCTION_ORDER,
  TERRACE_FASTENING_LABELS,
  TERRACE_FASTENING_ORDER,
  TERRACE_FOUNDATION_LABELS,
  TERRACE_FOUNDATION_ORDER,
  UNITS,
  VAT_PERCENT_DISPLAY,
  type CatalogueItem,
  type CeilingTypeKey,
  type DifficultyKey,
  type InsulationOptionKey,
  type MaterialTier,
  type PartitionScopeKey,
  type TerraceConstructionKey,
  type TerraceFasteningKey,
  type TerraceFoundationKey
} from "@/lib/pricing/public";
import type {
  CustomerEstimateLine,
  CustomerEstimateSummary,
  EstimateRequest,
  EstimateRequestLine,
  EstimateResponse
} from "@/lib/pricing/contract";

/**
 * Prisestimat-byggeren.
 *
 * VIKTIG ARKITEKTURVALG: denne komponenten kjenner INGEN priser. Den
 * samler kundens valg, sender dem til /api/estimate og viser svaret.
 * Timerate, produktivitet, materialpriser, oppskrifter, svinn og
 * prisbuffer ligger bak `import "server-only"` i src/server/pricing og
 * havner aldri i nettleserpakka.
 *
 * Katalogen komponenten får inn er allerede vasket: navn, enhet,
 * kategori, søkeord og to boolske flagg. Ingen kroner, ingen timer.
 */

/** Hvilke valggrupper en post bruker. Avledet av ID, ikke av priser. */
const TERRACE_IDS_HINT = ["terrasse", "platting", "terrassebord"];

type Row = {
  id: string;
  /** Fritekst kunden har skrevet. */
  name: string;
  /** Valgt katalogpost, når vi har truffet en. */
  catalogueId?: string;
  matchName?: string;
  note?: string;
  unit: string;
  qty: string;
  optionGroups: string[];
  difficulty?: DifficultyKey;
  terraceConstruction?: TerraceConstructionKey;
  terraceFastening?: TerraceFasteningKey;
  terraceFoundation?: TerraceFoundationKey;
  ceilingType?: CeilingTypeKey;
  partitionScope?: PartitionScopeKey;
  facadeInsulation?: InsulationOptionKey;
};

const TIER_ORDER: MaterialTier[] = ["none", "standard", "premium"];

/** Bygger API-forespørselen. Sender valg — aldri priser. */
function toRequest(rows: Row[], materialTier: MaterialTier): EstimateRequest {
  const lines: EstimateRequestLine[] = rows
    .filter((r) => r.catalogueId || r.name)
    .map((r) => ({
      id: r.id,
      catalogueId: r.catalogueId,
      description: r.name || undefined,
      quantity: Number(String(r.qty).replace(",", ".")) || 0,
      unit: r.unit,
      difficulty: r.difficulty,
      terraceConstruction: r.terraceConstruction,
      terraceFastening: r.terraceFastening,
      terraceFoundation: r.terraceFoundation,
      ceilingType: r.ceilingType,
      partitionScope: r.partitionScope,
      facadeInsulation: r.facadeInsulation
    }));
  return { lines, materialTier };
}

export default function PrisestimatBuilder({
  catalogue
}: {
  catalogue: CatalogueItem[];
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [projectName, setProjectName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPostal, setCustomerPostal] = useState("");
  const [message, setMessage] = useState("");
  const [materialTier, setMaterialTier] = useState<MaterialTier>("none");
  const [estimate, setEstimate] = useState<CustomerEstimateSummary | null>(null);
  const [calcError, setCalcError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const request = useMemo(
    () => toRequest(rows, materialTier),
    [rows, materialTier]
  );

  /**
   * Henter estimatet fra serveren. Debouncet, så vi ikke fyrer av et kall
   * per tastetrykk — både for ytelse og for å holde takstgrensa i API-et
   * godt klar av en vanlig kunde.
   */
  useEffect(() => {
    if (request.lines.length === 0) {
      setEstimate(null);
      setCalcError("");
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/estimate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(request),
          signal: controller.signal
        });
        const data: EstimateResponse = await res.json();
        if (data.ok) {
          setEstimate(data.estimate);
          setCalcError("");
        } else {
          setCalcError(data.error);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setCalcError("Kunne ikke hente estimatet akkurat nå.");
        }
      }
    }, 350);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [request]);

  const addRow = useCallback((item?: CatalogueItem) => {
    setRows((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: item?.name ?? "",
        catalogueId: item?.id,
        matchName: item?.name,
        note: item?.note,
        unit: item?.unit ?? "m²",
        qty: "",
        optionGroups: item?.optionGroups ?? [],
        difficulty: item ? "normal" : undefined
      }
    ]);
    setShowBrowse(false);
  }, []);

  const updateRow = useCallback(
    (id: string, field: keyof Row, value: string) => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const next: Row = { ...r, [field]: value } as Row;
          if (field === "name") {
            if (value.length >= 2) {
              const match = findBestMatch(value, catalogue);
              if (match && match.name !== r.matchName) {
                next.catalogueId = match.id;
                next.matchName = match.name;
                next.unit = match.unit;
                next.note = match.note;
                next.optionGroups = match.optionGroups;
                next.difficulty = next.difficulty ?? "normal";
              }
            } else {
              next.catalogueId = undefined;
              next.matchName = undefined;
              next.note = undefined;
              next.optionGroups = [];
            }
          }
          return next;
        })
      );
    },
    [catalogue]
  );

  const deleteRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const lineById = useMemo(() => {
    const m = new Map<string, CustomerEstimateLine>();
    estimate?.lines.forEach((l) => m.set(l.id, l));
    return m;
  }, [estimate]);

  const canSubmit = rows.length > 0 && customerName !== "" && customerEmail !== "";

  const downloadPdf = useCallback(async () => {
    setSending(true);
    setFeedback("");
    try {
      const res = await fetch("/api/prisestimat/pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectName,
          customerName,
          customerEmail,
          customerPhone,
          customerPostal,
          message,
          estimateRequest: request
        })
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prisestimat-${(projectName || "prisestimat")
        .replace(/[^a-z0-9æøå\-_ ]/gi, "")
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setFeedback("PDF lastet ned. Vi har også fått en kopi.");
    } catch {
      setFeedback("Kunne ikke generere PDF. Prøv igjen eller ta kontakt direkte.");
    } finally {
      setSending(false);
    }
  }, [
    request,
    projectName,
    customerName,
    customerEmail,
    customerPhone,
    customerPostal,
    message
  ]);

  return (
    <div className="mx-auto max-w-[var(--page-max)] px-6 pb-40 md:px-10">
      <div className="rule mb-14" />

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
            <Field label="Prosjektnavn" placeholder="F.eks. Tilbygg Uglåsvegen" value={projectName} onChange={setProjectName} />
            <Field label="Navn *" placeholder="Ditt navn" value={customerName} onChange={setCustomerName} required />
            <Field label="E-post *" type="email" placeholder="deg@epost.no" value={customerEmail} onChange={setCustomerEmail} required />
            <Field label="Telefon" type="tel" placeholder="+47 ..." value={customerPhone} onChange={setCustomerPhone} />
            <Field label="Postnummer" placeholder="5957" value={customerPostal} onChange={setCustomerPostal} />
            <Field label="Litt om prosjektet" placeholder="Beskrivelse, plassering, tidsplan" value={message} onChange={setMessage} />
          </div>
        </div>
      </div>

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
            onClick={() => addRow()}
            className="eyebrow border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-bone"
          >
            + Ny post
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 border-y border-ink/10 py-20 text-center">
          <p className="headline text-3xl md:text-4xl">Bare begynn å skrive.</p>
          <p className="mx-auto mt-4 max-w-md text-ink/70">
            Skriv en beskrivelse i første post — <em>«terrasse 36 m²»</em>,{" "}
            <em>«nytt vindu»</em>, <em>«ny kledning»</em> — så tar vi resten.
          </p>
        </div>
      ) : (
        <div className="mt-10 border-y border-ink/15">
          <div className="hidden md:grid grid-cols-[minmax(0,1fr)_4.5rem_5rem_7rem_2rem] items-center gap-3 border-b border-ink/10 py-3 lg:grid-cols-[minmax(0,1fr)_5rem_6rem_8rem_2.5rem] lg:gap-4">
            <span className="eyebrow text-ink/50">Hva skal gjøres</span>
            <span className="eyebrow text-center text-ink/50">Enhet</span>
            <span className="eyebrow text-right text-ink/50">Mengde</span>
            <span className="eyebrow text-right text-ink/50">Arbeid</span>
            <span aria-hidden />
          </div>

          {rows.map((row, i) => (
            <RowItem
              key={row.id}
              row={row}
              index={i}
              line={lineById.get(row.id)}
              updateRow={updateRow}
              deleteRow={deleteRow}
            />
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <EstimatePanel
          rows={rows}
          estimate={estimate}
          calcError={calcError}
          materialTier={materialTier}
          onSelectTier={setMaterialTier}
          projectName={projectName}
          message={message}
          customerPostal={customerPostal}
          canSubmit={canSubmit}
          sending={sending}
          feedback={feedback}
          onDownload={downloadPdf}
          onShowSummary={() => setShowSummary(true)}
        />
      )}

      {showBrowse && (
        <BrowseModal
          catalogue={catalogue}
          onSelect={addRow}
          onClose={() => setShowBrowse(false)}
        />
      )}
      {showSummary && (
        <SummaryModal
          projectName={projectName}
          customerName={customerName}
          customerEmail={customerEmail}
          rows={rows}
          estimate={estimate}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────── Prisestimat-panel ─────────────────── */

function EstimatePanel({
  rows,
  estimate,
  calcError,
  materialTier,
  onSelectTier,
  projectName,
  message,
  customerPostal,
  canSubmit,
  sending,
  feedback,
  onDownload,
  onShowSummary
}: {
  rows: Row[];
  estimate: CustomerEstimateSummary | null;
  calcError: string;
  materialTier: MaterialTier;
  onSelectTier: (t: MaterialTier) => void;
  projectName: string;
  message: string;
  customerPostal: string;
  canSubmit: boolean;
  sending: boolean;
  feedback: string;
  onDownload: () => void;
  onShowSummary: () => void;
}) {
  if (calcError) {
    return (
      <p className="mt-14 border-l-2 border-ink/30 pl-4 text-sm text-ink/70">
        {calcError}
      </p>
    );
  }
  if (!estimate) {
    return (
      <p className="mt-14 eyebrow text-ink/50">Beregner …</p>
    );
  }

  const visibleTiers = TIER_ORDER.filter((t) => estimate.scenarios[t].available);
  const active = estimate.scenarios[estimate.selectedTier];

  return (
    <div className="mt-14 grid gap-10 md:grid-cols-12">
      <div className="md:col-span-4">
        <p className="eyebrow text-ink/60">Ditt prisestimat</p>
        <h2 className="headline mt-4 text-3xl md:text-4xl">Hva vil det koste?</h2>
        <p className="mt-6 max-w-sm text-sm text-ink/70">
          Arbeidet er beregnet ut fra prosjektets størrelse og valgt
          utførelse. Materialene regnes hver for seg, med veiledende norske
          referansepriser.
        </p>
      </div>

      <div className="md:col-span-8">
        <fieldset>
          <legend className="eyebrow mb-4 text-ink/60">Materialer</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTiers.map((tier) => {
              const s = estimate.scenarios[tier];
              const selected = tier === estimate.selectedTier;
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
                  <span className={`eyebrow block ${selected ? "text-bone/70" : "text-ink/60"}`}>
                    {s.label}
                  </span>
                  <span className="headline mt-4 block text-2xl md:text-3xl">
                    {incomplete ? "Fra " : ""}
                    {formatNok(s.totalIncVat)} kr
                  </span>
                  <span className={`mt-1 block text-xs ${selected ? "text-bone/70" : "text-ink/60"}`}>
                    inkl. mva
                  </span>
                  <span className={`mt-3 block text-sm ${selected ? "text-bone/85" : "text-ink/75"}`}>
                    {incomplete ? "Fra " : ""}
                    {formatNok(s.subtotalExVat)} kr eks. mva
                  </span>
                  {incomplete ? (
                    <span className={`mt-3 block text-xs ${selected ? "text-bone/70" : "text-ink/55"}`}>
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

        <div className="mt-8 border-t border-ink pt-6">
          <p className="eyebrow mb-2 text-ink/60">
            Veiledende estimat · {active.label}
            {estimate.selectedTier !== "none" && !active.materialEstimateComplete
              ? " · delvis materialestimat"
              : ""}
          </p>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <span className="headline text-3xl md:text-5xl">
              {formatNok(active.range.low)}
              <span className="text-ink/40"> – </span>
              {formatNok(active.range.high)} kr
            </span>
            <span className="text-sm text-ink/60">inkl. mva</span>
          </div>
        </div>

        {estimate.hasPendingLabor ? (
          <p className="mt-4 border-l-2 border-ink/25 pl-4 text-sm text-ink/70">
            En eller flere poster kan ikke beregnes automatisk ennå og er ikke
            med i summen. De er merket i lista over.
          </p>
        ) : null}

        {estimate.unpriced.length > 0 && estimate.selectedTier !== "none" ? (
          <div className="mt-6 border border-dashed border-ink/20 p-4 text-sm text-ink/70">
            <p className="eyebrow mb-2 text-ink/60">Avklares separat</p>
            <ul className="space-y-1">
              {estimate.unpriced.map((u) => (
                <li key={u.label}>
                  <span className="font-medium text-ink/85">{u.label}</span> — {u.note}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Detaljert beregning.
            Viser HVA som inngår og hva hver del koster — ikke formelen bak.
            Timeforbruk, enhetspriser, forbruksmengder, svinn og prisbuffer
            forlater aldri serveren. */}
        <details className="mt-8 border border-ink/15">
          <summary className="cursor-pointer px-4 py-3 eyebrow text-ink/70">
            Se beregning
          </summary>
          <div className="space-y-8 border-t border-ink/10 p-4 text-sm text-ink/75 md:p-6">
            <section>
              <p className="eyebrow mb-3 text-ink/60">Arbeid</p>
              {estimate.lines.map((l) => (
                <BreakdownRow
                  key={`labor-${l.id}`}
                  left={
                    <>
                      {l.label}
                      <span className="block text-xs text-ink/55">
                        {formatQty(l.quantity)} {l.unit}
                        {l.chosenOptions.length > 0
                          ? ` · ${l.chosenOptions.join(" · ")}`
                          : ""}
                      </span>
                    </>
                  }
                  right={`${formatNok(l.laborExVat)} kr`}
                />
              ))}
              <BreakdownRow
                emphasis
                left="Sum arbeid"
                right={`${formatNok(active.laborExVat)} kr eks. mva`}
              />
            </section>

            {estimate.selectedTier !== "none" ? (
              <section>
                <p className="eyebrow mb-3 text-ink/60">Materialer</p>
                {estimate.lines.map((l) => (
                  <div key={`mat-${l.id}`} className="mb-3">
                    <BreakdownRow
                      left={l.label}
                      right={
                        l.materialExVat > 0
                          ? `${formatNok(l.materialExVat)} kr`
                          : "avklares"
                      }
                    />
                    {l.notIncluded.length > 0 ? (
                      <p className="mt-1 text-xs text-ink/55">
                        Ikke medregnet: {l.notIncluded.join(", ")} — avklares ved
                        befaring.
                      </p>
                    ) : null}
                  </div>
                ))}
                <BreakdownRow
                  emphasis
                  left="Sum materialer"
                  right={`${formatNok(active.materialExVat)} kr eks. mva`}
                />
                <p className="mt-3 text-xs text-ink/55">
                  Materialprisene er veiledende norske referansepriser, bevisst
                  satt konservativt slik at estimatet ikke havner for lavt.
                  Svinn og prisreserve er regnet med.
                </p>
              </section>
            ) : null}

            <section className="border-t border-ink/20 pt-4">
              <BreakdownRow
                left="Sum eks. mva"
                right={`${formatNok(active.subtotalExVat)} kr`}
              />
              <BreakdownRow
                left={`MVA (${estimate.vatPercent} %)`}
                right={`${formatNok(active.vat)} kr`}
              />
              <BreakdownRow
                emphasis
                left="Totalt inkl. mva"
                right={`${formatNok(active.totalIncVat)} kr`}
              />
            </section>
          </div>
        </details>

        <p className="mt-8 max-w-2xl border-l-2 border-ink/30 pl-4 text-sm text-ink/70">
          <strong className="font-semibold">
            Veiledende prisestimat — ikke bindende tilbud.
          </strong>{" "}
          {ESTIMATE_DISCLAIMER} {ESTIMATE_DISCLAIMER_CLOSING}
        </p>

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
              buildEnquiryPrefill({ rows, estimate, projectName, message, customerPostal })
            )}`}
            className="group mt-6 inline-flex items-center gap-3 border border-ink bg-ink px-7 py-4 eyebrow text-bone press hover:bg-transparent hover:text-ink"
          >
            Be om befaring
            <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <button
            type="button"
            disabled={!canSubmit || sending}
            onClick={onDownload}
            className="group inline-flex items-center gap-4 border border-ink bg-ink px-8 py-5 eyebrow text-bone press hover:bg-transparent hover:text-ink disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-bone"
          >
            {sending ? "Genererer PDF…" : "Last ned prisestimat"}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
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

/* ─────────────────────────── Rad ─────────────────────────── */

function RowItem({
  row,
  index,
  line,
  updateRow,
  deleteRow
}: {
  row: Row;
  index: number;
  line?: CustomerEstimateLine;
  updateRow: (id: string, field: keyof Row, value: string) => void;
  deleteRow: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const groups = row.optionGroups;

  useEffect(() => {
    if (!row.name && inputRef.current) inputRef.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`row-enter grid grid-cols-1 gap-y-6 py-8 md:grid-cols-[minmax(0,1fr)_4.5rem_5rem_7rem_2rem] md:items-center md:gap-3 md:gap-y-2 md:py-5 lg:grid-cols-[minmax(0,1fr)_5rem_6rem_8rem_2.5rem] lg:gap-4 ${
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
        {row.matchName ? (
          <div className="match-badge mt-3 text-ink/60">
            <span className="eyebrow block text-[0.6rem] text-ink/70 md:mr-2 md:inline md:text-[0.72rem]">
              Auto
            </span>
            <p className="mt-1 text-sm leading-relaxed md:mt-0 md:inline md:text-xs">
              {row.matchName}
              {row.note ? (
                <span className="text-ink/50">{` · ${row.note}`}</span>
              ) : null}
            </p>
          </div>
        ) : null}

        {groups.includes("difficulty") ? (
          <div className="mt-5 md:mt-2">
            <RowSelect
              label="Tilkomst"
              value={row.difficulty ?? "normal"}
              onChange={(v) => updateRow(row.id, "difficulty", v)}
              options={DIFFICULTY_ORDER.map((k) => [k, DIFFICULTY_LABELS[k]])}
            />
          </div>
        ) : null}

        {groups.includes("terrace") ? (
          <div className="mt-5 grid gap-5 md:mt-2 md:flex md:flex-wrap md:gap-x-5 md:gap-y-2">
            <RowSelect
              label="Konstruksjon"
              value={row.terraceConstruction ?? "standard"}
              onChange={(v) => updateRow(row.id, "terraceConstruction", v)}
              options={TERRACE_CONSTRUCTION_ORDER.map((k) => [k, TERRACE_CONSTRUCTION_LABELS[k]])}
            />
            <RowSelect
              label="Innfesting"
              value={row.terraceFastening ?? "visible"}
              onChange={(v) => updateRow(row.id, "terraceFastening", v)}
              options={TERRACE_FASTENING_ORDER.map((k) => [k, TERRACE_FASTENING_LABELS[k]])}
            />
            <RowSelect
              label="Fundament"
              value={row.terraceFoundation ?? "existing"}
              onChange={(v) => updateRow(row.id, "terraceFoundation", v)}
              options={TERRACE_FOUNDATION_ORDER.map((k) => [k, TERRACE_FOUNDATION_LABELS[k]])}
            />
          </div>
        ) : null}

        {groups.includes("ceiling") ? (
          <div className="mt-5 grid gap-5 md:mt-2 md:flex md:flex-wrap md:gap-x-5 md:gap-y-2">
            <RowSelect
              label="Himlingstype"
              value={row.ceilingType ?? "direct"}
              onChange={(v) => updateRow(row.id, "ceilingType", v)}
              options={CEILING_TYPE_ORDER.map((k) => [k, CEILING_TYPE_LABELS[k]])}
            />
          </div>
        ) : null}

        {groups.includes("partition") ? (
          <div className="mt-5 grid gap-5 md:mt-2 md:flex md:flex-wrap md:gap-x-5 md:gap-y-2">
            <RowSelect
              label="Omfang"
              value={row.partitionScope ?? "complete"}
              onChange={(v) => updateRow(row.id, "partitionScope", v)}
              options={PARTITION_SCOPE_ORDER.map((k) => [k, PARTITION_SCOPE_LABELS[k]])}
            />
          </div>
        ) : null}

        {groups.includes("insulation") ? (
          <div className="mt-5 grid gap-5 md:mt-2 md:flex md:flex-wrap md:gap-x-5 md:gap-y-2">
            <RowSelect
              label="Etterisolering"
              value={row.facadeInsulation ?? "none"}
              onChange={(v) => updateRow(row.id, "facadeInsulation", v)}
              options={INSULATION_OPTION_ORDER.map((k) => [k, INSULATION_OPTION_LABELS[k]])}
            />
          </div>
        ) : null}

        {line?.laborPending && line.pendingNote ? (
          <p className="mt-2 text-xs text-ink/60">{line.pendingNote}</p>
        ) : null}
      </div>

      <div className="md:contents">
        <span className="eyebrow mb-2 block text-ink/50 md:hidden">Mengde</span>
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

      <div className="md:contents">
        <span className="eyebrow mb-1 block text-ink/50 md:hidden">
          Estimert arbeid
        </span>
        <div className="text-right text-base font-medium text-ink md:text-lg">
          <span className="float-left md:hidden">
            {line && line.laborExVat > 0 ? (
              <span className="text-xl">{formatNok(line.laborExVat)} kr</span>
            ) : (
              "—"
            )}
            <span className="ml-2 text-xs font-normal text-ink/55">eks. mva</span>
          </span>
          <span className="hidden md:inline">
            {line && line.laborExVat > 0 ? `${formatNok(line.laborExVat)} kr` : "—"}
          </span>
        </div>
      </div>

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

/* ─────────────────────────── Modaler ─────────────────────────── */

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
            className="flex min-h-[44px] min-w-[44px] items-center justify-end text-2xl text-ink/50 hover:text-ink"
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
  catalogue,
  onSelect,
  onClose
}: {
  catalogue: CatalogueItem[];
  onSelect: (item: CatalogueItem) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const priceable = useMemo(() => catalogue.filter((c) => c.priceable), [catalogue]);
  const bySurvey = useMemo(() => catalogue.filter((c) => !c.priceable), [catalogue]);

  const cats = useMemo(() => {
    const map: Record<string, CatalogueItem[]> = {};
    priceable.forEach((e) => {
      (map[e.category] ??= []).push(e);
    });
    return map;
  }, [priceable]);

  const filtered =
    search.length >= 2
      ? priceable.filter(
          (e) =>
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()))
        )
      : null;

  return (
    <ModalShell onClose={onClose} title="Prisliste">
      <input
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Søk — f.eks. «vindu», «terrasse», «kledning»…"
        className="min-h-[48px] w-full border-b border-ink/30 bg-transparent py-3 text-base focus:border-ink focus:outline-none md:text-lg"
      />

      <div className="mt-8 space-y-10">
        {filtered ? (
          filtered.length === 0 ? (
            <p className="py-8 text-center text-ink/60">Ingen treff.</p>
          ) : (
            <ul className="grid gap-3">
              {filtered.map((e) => (
                <CatalogueRow key={e.id} item={e} onSelect={onSelect} />
              ))}
            </ul>
          )
        ) : (
          Object.entries(cats).map(([cat, entries]) => (
            <section key={cat}>
              <h3 className="headline mb-4 text-2xl">{cat}</h3>
              <ul className="grid gap-3">
                {entries.map((e) => (
                  <CatalogueRow key={e.id} item={e} onSelect={onSelect} />
                ))}
              </ul>
            </section>
          ))
        )}

        <section>
          <h3 className="headline mb-4 text-2xl">Etter befaring</h3>
          <ul className="grid gap-3">
            {bySurvey.map((n) => (
              <li key={n.id} className="border-l-2 border-ink/30 py-3 pl-4 text-ink/80">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium">{n.name}</span>
                  <a className="uline eyebrow text-xs" href="/kontakt">
                    Book befaring →
                  </a>
                </div>
                {n.note ? <p className="mt-1 text-sm text-ink/60">{n.note}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ModalShell>
  );
}

/**
 * Katalograden viser navn, enhet og hva som inngår — bevisst ingen
 * kroner og ingen timer. Prisen får kunden når posten er lagt inn med
 * en mengde, og den kommer fra serveren.
 */
function CatalogueRow({
  item,
  onSelect
}: {
  item: CatalogueItem;
  onSelect: (e: CatalogueItem) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="flex min-h-[44px] w-full items-baseline justify-between gap-4 border-b border-ink/10 py-3 text-left transition-colors hover:bg-ink/[0.03]"
      >
        <span>
          <span className="text-base font-medium text-ink">{item.name}</span>
          {item.note ? (
            <span className="ml-3 text-sm text-ink/60">{item.note}</span>
          ) : null}
        </span>
        <span className="eyebrow whitespace-nowrap text-ink/70">
          per {item.unit}
        </span>
      </button>
    </li>
  );
}

function SummaryModal({
  projectName,
  customerName,
  customerEmail,
  rows,
  estimate,
  onClose
}: {
  projectName: string;
  customerName: string;
  customerEmail: string;
  rows: Row[];
  estimate: CustomerEstimateSummary | null;
  onClose: () => void;
}) {
  const byId = new Map(estimate?.lines.map((l) => [l.id, l]) ?? []);
  const active = estimate?.scenarios[estimate.selectedTier];

  return (
    <ModalShell onClose={onClose} title={`Sammendrag · ${projectName || "Uten navn"}`}>
      {customerName ? (
        <p className="mb-6 text-sm text-ink/70">
          Kunde: <span className="font-medium">{customerName}</span>
          {customerEmail ? ` · ${customerEmail}` : ""}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-ink/60">Ingen poster.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-ink/20">
              <th className="eyebrow py-3 text-left text-ink/60">Beskrivelse</th>
              <th className="eyebrow py-3 text-right text-ink/60">Mengde</th>
              <th className="eyebrow py-3 text-right text-ink/60">Arbeid</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const l = byId.get(r.id);
              return (
                <tr key={r.id} className="border-b border-ink/10">
                  <td className="py-3">
                    <div className="font-medium">{r.matchName || r.name || "—"}</div>
                    {r.note ? (
                      <div className="text-xs text-ink/60">{r.note}</div>
                    ) : null}
                  </td>
                  <td className="py-3 text-right text-sm text-ink/70">
                    {r.qty || "—"} {r.unit}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {l && l.laborExVat > 0 ? `${formatNok(l.laborExVat)} kr` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {active ? (
        <div className="mt-8 grid gap-2 border-t border-ink/20 pt-6">
          <TotalLine label="Arbeid (eks. mva)" value={`${formatNok(active.laborExVat)} kr`} />
          <TotalLine
            label={`Materialer — ${MATERIAL_TIER_LABELS[estimate!.selectedTier]}`}
            value={
              estimate!.selectedTier === "none"
                ? "ikke medregnet"
                : `${formatNok(active.materialExVat)} kr`
            }
          />
          <TotalLine
            label={`MVA (${estimate!.vatPercent} %)`}
            value={`${formatNok(active.vat)} kr`}
          />
          <div className="mt-4 flex items-baseline justify-between border-t border-ink pt-4">
            <span className="eyebrow">Totalt</span>
            <span className="headline text-3xl md:text-4xl">
              {formatNok(active.totalIncVat)} kr
            </span>
          </div>
        </div>
      ) : null}
    </ModalShell>
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

/**
 * Meldingsteksten som følger kunden videre til kontaktskjemaet.
 * Inneholder valg og priser — aldri timeforbruk eller enhetspriser.
 */
function buildEnquiryPrefill({
  rows,
  estimate,
  projectName,
  message,
  customerPostal
}: {
  rows: Row[];
  estimate: CustomerEstimateSummary | null;
  projectName: string;
  message: string;
  customerPostal: string;
}): string {
  const lines: string[] = [];
  if (projectName) lines.push(`Prosjekt: ${projectName}`);
  if (customerPostal) lines.push(`Postnummer: ${customerPostal}`);
  lines.push("");
  lines.push("Poster fra prisestimatet:");

  const byId = new Map(estimate?.lines.map((l) => [l.id, l]) ?? []);
  for (const r of rows) {
    if (!r.name && !r.matchName) continue;
    const l = byId.get(r.id);
    const label = r.matchName || r.name;
    const opts = l && l.chosenOptions.length > 0 ? ` [${l.chosenOptions.join(" · ")}]` : "";
    lines.push(`• ${label}${opts} — ${r.qty || "?"} ${r.unit}`);
  }

  if (estimate) {
    const active = estimate.scenarios[estimate.selectedTier];
    lines.push("");
    lines.push(`Materialvalg: ${MATERIAL_TIER_LABELS[estimate.selectedTier]}`);
    if (estimate.hasPendingLabor) {
      lines.push(
        "MERK: én eller flere poster kunne ikke beregnes automatisk og er ikke med i summen."
      );
    }
    lines.push(`Arbeid: ${formatNok(active.laborExVat)} kr eks. mva`);
    if (estimate.selectedTier !== "none") {
      lines.push(`Materialer: ${formatNok(active.materialExVat)} kr eks. mva`);
      if (!active.materialEstimateComplete) {
        lines.push(
          "  MERK: delvis materialestimat — deler av materialene avklares ved befaring."
        );
      }
    }
    lines.push(`Sum eks. mva: ${formatNok(active.subtotalExVat)} kr`);
    lines.push(`MVA (${estimate.vatPercent} %): ${formatNok(active.vat)} kr`);
    lines.push(`Totalt inkl. mva: ${formatNok(active.totalIncVat)} kr`);
    lines.push(
      `Veiledende spenn: ${formatNok(active.range.low)} – ${formatNok(active.range.high)} kr inkl. mva`
    );
    if (estimate.unpriced.length > 0) {
      lines.push("");
      lines.push("Avklares separat:");
      for (const u of estimate.unpriced) lines.push(`• ${u.label} — ${u.note}`);
    }
  }

  lines.push("");
  lines.push(ESTIMATE_DISCLAIMER_CLOSING);
  if (message) {
    lines.push("");
    lines.push(message);
  }
  return lines.join("\n");
}
