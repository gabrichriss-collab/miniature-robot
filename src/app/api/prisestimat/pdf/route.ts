import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { EstimatePdf } from "@/server/pricing/estimatePdfDoc";
import { calcTotals, formatNok, type EstimateInput } from "@/server/pricing/estimateCalc";
import { resolveCatalogueId } from "@/server/pricing/catalogue";
import { notifyLead } from "@/lib/notifyLead";
import { clientIp, escape, osloNow, rateLimit, saveLead } from "@/lib/http";
import {
  MAX_LINES,
  parseQuantity,
  readLineOptions
} from "@/server/pricing/requestInput";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

/**
 * Bygger den interne kalkyle-inputen fra kundens VALG.
 *
 * Klienten sender katalog-ID, mengde og valg — aldri timer, satser eller
 * summer. Arbeidsnøkkel, oppskrift og alle tall slås opp her, på serveren,
 * akkurat som i /api/estimate.
 */
function buildInput(raw: unknown): EstimateInput | null {
  if (typeof raw !== "object" || raw === null) return null;
  const b = raw as Record<string, unknown>;
  const req = b.estimateRequest as
    | { lines?: unknown[]; materialTier?: unknown }
    | undefined;
  if (!req || !Array.isArray(req.lines) || req.lines.length > MAX_LINES) return null;

  const tier = ["none", "standard", "premium"].includes(String(req.materialTier))
    ? (req.materialTier as EstimateInput["materialTier"])
    : "none";

  const rows = req.lines.flatMap((rawLine) => {
    if (typeof rawLine !== "object" || rawLine === null) return [];
    const l = rawLine as Record<string, unknown>;
    const entry =
      typeof l.catalogueId === "string" ? resolveCatalogueId(l.catalogueId) : undefined;
    const qty = parseQuantity(l.quantity);
    if (qty === null) return [];
    const options = readLineOptions(l);
    return [
      {
        id: String(l.id ?? "").slice(0, 64),
        name: entry?.name ?? String(l.description ?? "").slice(0, 200),
        matchName: entry?.name,
        note: entry?.note,
        unit: entry?.unit ?? String(l.unit ?? "m²").slice(0, 8),
        qty,
        workItemKey: entry?.workItemKey,
        materialRecipeKey: entry?.materialRecipeKey,
        ...options,
        terraceFastening: options.terraceFastening ?? entry?.terraceFastening
      }
    ];
  });

  return {
    projectName: String(b.projectName ?? "").slice(0, 200),
    customerName: String(b.customerName ?? "").slice(0, 200),
    customerEmail: String(b.customerEmail ?? "").slice(0, 200),
    customerPhone: String(b.customerPhone ?? "").slice(0, 60),
    customerPostal: String(b.customerPostal ?? "").slice(0, 20),
    message: String(b.message ?? "").slice(0, 4000),
    rows,
    mvaRate: 25,
    materialTier: tier
  };
}

export async function POST(req: Request) {
  // Hver PDF sendes som e-post til eieren, så taket er lavt.
  const limit = rateLimit(`pdf:${clientIp(req) ?? "ukjent"}`, 10, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "For mange forespørsler. Prøv igjen om litt." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } }
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Forespørselen er for stor." }, { status: 413 });
  }

  let body: EstimateInput | null;
  try {
    body = buildInput(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  if (!body) {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }
  if (body.rows.length === 0) {
    return NextResponse.json({ error: "Estimatet har ingen poster." }, { status: 422 });
  }
  if (!body.customerName || !body.customerEmail) {
    return NextResponse.json(
      { error: "Navn og e-post kreves for å generere PDF." },
      { status: 422 }
    );
  }

  const buffer = await renderToBuffer(EstimatePdf({ input: body }));
  const totals = calcTotals(body);

  const entry = {
    ts: new Date().toISOString(),
    kind: "prisestimat" as const,
    project: body.projectName,
    customer: {
      name: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone ?? null,
      postal: body.customerPostal ?? null
    },
    total: totals.total,
    rowCount: body.rows.length,
    rows: body.rows,
    ip: clientIp(req)
  };

  await saveLead("prisestimat.jsonl", entry, {
    customer: entry.customer,
    total: `${formatNok(totals.total)} kr`,
    rows: entry.rowCount
  });

  const safeName = (body.projectName || "prisestimat")
    .replace(/[^a-z0-9æøå\-_ ]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  const totalKr = `${formatNok(totals.total)} kr`;
  const text = [
    `Ny henvendelse via nettsiden — prisestimat lastet ned.`,
    ``,
    `Prosjekt: ${body.projectName || "(uten navn)"}`,
    `Kunde:    ${body.customerName}`,
    `E-post:   ${body.customerEmail}`,
    body.customerPhone ? `Telefon:  ${body.customerPhone}` : null,
    body.customerPostal ? `Postnr.:  ${body.customerPostal}` : null,
    ``,
    `Estimert totalt: ${totalKr}`,
    `Antall poster:   ${entry.rowCount}`,
    ``,
    body.message ? `Prosjektbeskrivelse:\n${body.message}\n` : null,
    `PDF-en er vedlagt denne e-posten.`,
    ``,
    `— Sendt ${osloNow()}`
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Georgia,serif;color:#0a0a0a;max-width:640px">
      <h2 style="font-family:'Sorts Mill Goudy',Georgia,serif;font-weight:400;font-size:28px;margin:0 0 8px">
        Ny henvendelse — Prisestimat
      </h2>
      <p style="color:#666;margin:0 0 24px">Kunde lastet ned et prisestimat fra tomrerkawiche.no</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:6px 0;color:#666;width:130px">Prosjekt</td><td style="padding:6px 0"><strong>${escape(body.projectName || "(uten navn)")}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666">Kunde</td><td style="padding:6px 0">${escape(body.customerName)}</td></tr>
        <tr><td style="padding:6px 0;color:#666">E-post</td><td style="padding:6px 0"><a href="mailto:${escape(body.customerEmail)}">${escape(body.customerEmail)}</a></td></tr>
        ${body.customerPhone ? `<tr><td style="padding:6px 0;color:#666">Telefon</td><td style="padding:6px 0"><a href="tel:${escape(body.customerPhone)}">${escape(body.customerPhone)}</a></td></tr>` : ""}
        ${body.customerPostal ? `<tr><td style="padding:6px 0;color:#666">Postnr.</td><td style="padding:6px 0">${escape(body.customerPostal)}</td></tr>` : ""}
        <tr><td style="padding:6px 0;color:#666">Poster</td><td style="padding:6px 0">${entry.rowCount}</td></tr>
        <tr><td style="padding:12px 0;color:#666;border-top:1px solid #eee">Estimert totalt</td><td style="padding:12px 0;border-top:1px solid #eee;font-family:'Sorts Mill Goudy',Georgia,serif;font-size:22px">${totalKr}</td></tr>
      </table>
      ${body.message ? `<div style="margin-top:24px;padding:16px;border-left:2px solid #c9c4bc;white-space:pre-wrap">${escape(body.message)}</div>` : ""}
      <p style="margin-top:32px;color:#999;font-size:12px">
        PDF-en er vedlagt. Trykk «Svar» for å svare kunden direkte.
      </p>
    </div>
  `;

  await notifyLead({
    kind: "prisestimat",
    subject: `Ny henvendelse — Prisestimat: ${body.projectName || body.customerName} — ${totalKr}`,
    text,
    html,
    meta: entry,
    replyTo: body.customerEmail,
    attachment: {
      filename: `prisestimat-${safeName}.pdf`,
      content: buffer,
      contentType: "application/pdf"
    }
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="prisestimat-${safeName}.pdf"`,
      "cache-control": "no-store"
    }
  });
}
