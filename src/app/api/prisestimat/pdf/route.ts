import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { EstimatePdf } from "@/lib/estimatePdfDoc";
import { calcTotals, formatNok, type EstimateInput } from "@/lib/estimateCalc";
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

  // Log the lead — same pattern as /api/contact
  const entry = {
    ts: new Date().toISOString(),
    kind: "prisestimat",
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

  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(entry)
      });
    } catch (err) {
      console.error("[prisestimat] webhook failed", err);
    }
  }

  const safeName = (body.projectName || "prisestimat")
    .replace(/[^a-z0-9æøå\-_ ]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="prisestimat-${safeName}.pdf"`,
      "cache-control": "no-store"
    }
  });
}
