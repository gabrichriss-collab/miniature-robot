import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { EstimatePdf } from "@/lib/estimatePdfDoc";
import { calcTotals, formatNok, type EstimateInput } from "@/lib/estimateCalc";
import { notifyLead } from "@/lib/notifyLead";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: EstimateInput;
  try {
    body = (await req.json()) as EstimateInput;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  if (!body.rows || body.rows.length === 0) {
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
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null
  };

  try {
    const dir = path.join(process.cwd(), ".data");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, "prisestimat.jsonl"),
      JSON.stringify(entry) + "\n",
      "utf8"
    );
  } catch {
    console.log("[prisestimat] fs unavailable, logging only:", {
      customer: entry.customer,
      total: `${formatNok(totals.total)} kr`,
      rows: entry.rowCount
    });
  }

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
    `— Sendt ${new Date().toLocaleString("nb-NO")}`
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

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
