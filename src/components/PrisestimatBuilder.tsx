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
import {
  calcTotals,
  formatNok,
  type EstimateRow,
  type EstimateInput
} from "@/lib/estimateCalc";

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
        matchName: entry.name
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
              }
            } else {
              updated.matched = false;
              updated.matchName = "";
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
      markup
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
      markup
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
            Skriv hva som skal gjøres — for eksempel <em>«terrasse 36 m²»</em> —
            så foreslår systemet enhet og pris. Du kan også bla i prislisten og
            justere alt selv. Estimatet oppdateres nederst i sanntid.
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
            <em>«nytt vindu»</em>, <em>«ny kledning»</em> — så gjør vi resten.
          </p>
        </div>
      ) : (
        <div className="mt-10 border-y border-ink/15">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_5rem_6rem_7rem_8rem_2.5rem] items-center gap-4 border-b border-ink/10 py-3">
            <span className="eyebrow text-ink/50">Hva skal gjøres</span>
            <span className="eyebrow text-ink/50 text-center">Enhet</span>
            <span className="eyebrow text-ink/50 text-right">Mengde</span>
            <span className="eyebrow text-ink/50 text-right">Enh.pris</span>
            <span className="eyebrow text-ink/50 text-right">Sum</span>
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

      {/* Totals */}
      {rows.length > 0 && (
        <div className="mt-14 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow text-ink/60">Estimat</p>
          </div>
          <div className="md:col-span-8">
            <dl className="grid gap-2 border-t border-ink/15 pt-6 text-ink/80">
              <TotalLine
                label="Sum arbeider (eks. mva)"
                value={`${formatNok(totals.subtotal)} kr`}
              />
              <TotalLine
                label={`Påslag (${markup}%)`}
                value={`${formatNok(totals.markupAmount)} kr`}
              />
              <TotalLine
                label="Sum m/ påslag"
                value={`${formatNok(totals.subWithMarkup)} kr`}
              />
              <TotalLine
                label={`MVA (${mvaRate}%)`}
                value={`${formatNok(totals.mvaAmount)} kr`}
              />
              <div className="mt-4 flex items-baseline justify-between border-t border-ink pt-4">
                <span className="eyebrow">Estimert totalt</span>
                <span className="headline text-4xl md:text-5xl">
                  {formatNok(totals.total)} kr
                </span>
              </div>
            </dl>

            {/* Legal disclaimer */}
            <p className="mt-8 max-w-2xl border-l-2 border-ink/30 pl-4 text-sm text-ink/70">
              <strong className="font-semibold">Prisestimat, ikke bindende tilbud.</strong>{" "}
              Estimatet er basert på opplysningene du har oppgitt og våre
              standard-satser. Endelig tilbud gis skriftlig etter befaring.
              Alle priser er i norske kroner, inklusive materialer og
              arbeidstimer for arbeidene som er listet opp.
            </p>

            {/* Submit + download */}
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <button
                type="button"
                disabled={!canSubmit || sending}
                onClick={downloadPdf}
                className="group inline-flex items-center gap-4 border border-ink bg-ink px-8 py-5 eyebrow text-bone transition-colors hover:bg-transparent hover:text-ink disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-bone"
              >
                {sending ? "Genererer PDF…" : "Last ned prisestimat"}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  ↓
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowSummary(true)}
                className="uline eyebrow"
              >
                Se sammendrag →
              </button>
            </div>

            {!canSubmit && (
              <p className="mt-4 text-sm text-ink/60">
                Fyll inn navn og e-post for å laste ned. Da får både du og vi
                en kopi.
              </p>
            )}
            {feedback && (
              <p className="mt-4 text-sm text-ink/70">{feedback}</p>
            )}
          </div>
        </div>
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
  const rowTotal =
    (parseFloat(String(row.qty)) || 0) * (parseFloat(String(row.price)) || 0);

  useEffect(() => {
    if (!row.name && inputRef.current) inputRef.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`grid grid-cols-1 gap-2 py-5 md:grid-cols-[1fr_5rem_6rem_7rem_8rem_2.5rem] md:items-center md:gap-4 ${
        index !== 0 ? "border-t border-ink/10" : ""
      }`}
    >
      <div>
        <input
          ref={inputRef}
          className="w-full border-b border-ink/20 bg-transparent py-2 text-lg text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
          placeholder="Skriv hva som skal gjøres…"
          value={row.name}
          onChange={(e) => updateRow(row.id, "name", e.target.value)}
        />
        {row.matched && row.matchName ? (
          <p className="mt-2 text-xs text-ink/60">
            <span className="eyebrow mr-2 text-ink/80">Auto</span>
            {row.matchName}
            {row.note ? ` · ${row.note}` : ""}
          </p>
        ) : null}
      </div>

      <select
        className="border border-ink/20 bg-transparent px-2 py-2 text-center text-sm focus:border-ink focus:outline-none"
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
        step="any"
        min="0"
        className="border border-ink/20 bg-transparent px-3 py-2 text-right text-sm focus:border-ink focus:outline-none"
        placeholder="0"
        value={row.qty}
        onChange={(e) => updateRow(row.id, "qty", e.target.value)}
        aria-label="Mengde"
      />

      <input
        type="number"
        step="any"
        min="0"
        className="border-b border-ink/20 bg-transparent px-2 py-2 text-right text-sm focus:border-ink focus:outline-none"
        placeholder="0"
        value={row.price}
        onChange={(e) => updateRow(row.id, "price", e.target.value)}
        aria-label="Enhetspris"
      />

      <div className="text-right text-base font-medium text-ink md:text-lg">
        {row.qty && row.price ? `${formatNok(rowTotal)} kr` : "—"}
      </div>

      <button
        type="button"
        onClick={() => deleteRow(row.id)}
        aria-label="Fjern post"
        className="justify-self-end text-xl text-ink/40 transition-colors hover:text-ink"
      >
        ×
      </button>
    </div>
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
        className="mt-2 w-full border-b border-ink/30 bg-transparent py-3 text-lg placeholder:text-ink/40 focus:border-ink focus:outline-none"
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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-auto bg-bone shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-bone px-6 py-5 md:px-10">
          <p className="eyebrow">{title}</p>
          <button
            type="button"
            onClick={onClose}
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
          {formatNok(entry.price)} kr / {entry.unit}
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
              <th className="eyebrow py-3 text-right text-ink/60">Enh.pris</th>
              <th className="eyebrow py-3 text-right text-ink/60">Sum</th>
            </tr>
          </thead>
          <tbody>
            {input.rows.map((r) => {
              const t =
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
                    {formatNok(Number(r.price) || 0)} kr
                  </td>
                  <td className="py-3 text-right font-medium">
                    {r.qty ? `${formatNok(t)} kr` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="mt-8 grid gap-2 border-t border-ink/20 pt-6">
        <TotalLine
          label="Sum arbeider (eks. mva)"
          value={`${formatNok(totals.subtotal)} kr`}
        />
        <TotalLine
          label={`Påslag (${input.markup}%)`}
          value={`${formatNok(totals.markupAmount)} kr`}
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
