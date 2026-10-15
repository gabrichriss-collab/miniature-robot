import { NextResponse } from "next/server";

import type {
  EstimateRequest,
  EstimateRequestLine,
  EstimateResponse
} from "@/lib/pricing/contract";
import type { MaterialTier } from "@/lib/pricing/public";
import { resolveCatalogueId } from "@/server/pricing/catalogue";
import { toCustomerEstimate } from "@/server/pricing/toCustomerEstimate";
import type { EstimateLine } from "@/server/pricing/calculateEstimate";
import {
  MAX_LINES,
  oneOf,
  parseQuantity,
  readLineOptions
} from "@/server/pricing/requestInput";
import { clientIp, rateLimit } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;

function badRequest(error: string) {
  return NextResponse.json<EstimateResponse>({ ok: false, error }, { status: 400 });
}

export async function POST(req: Request) {
  // 60 per minutt: mer enn et menneske rekker, men stopper et skript
  // som vil kartlegge hele prismodellen.
  const limit = rateLimit(`estimate:${clientIp(req) ?? "ukjent"}`, 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json<EstimateResponse>(
      { ok: false, error: "For mange forespørsler. Prøv igjen om litt." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } }
    );
  }

  if (req.headers.get("content-type")?.includes("application/json") !== true) {
    return badRequest("Ugyldig innhold.");
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json<EstimateResponse>(
      { ok: false, error: "Forespørselen er for stor." },
      { status: 413 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return badRequest("Kunne ikke lese forespørselen.");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return badRequest("Kunne ikke lese forespørselen.");
  }

  const input = body as Partial<EstimateRequest>;
  if (!Array.isArray(input.lines)) return badRequest("Mangler poster.");
  if (input.lines.length > MAX_LINES) return badRequest("For mange poster.");

  const tier =
    oneOf(["none", "standard", "premium"] as const, input.materialTier) ?? "none";

  const requestLines: EstimateRequestLine[] = [];
  const engineLines: Array<EstimateLine & { requestId: string }> = [];

  for (const rawLine of input.lines) {
    if (typeof rawLine !== "object" || rawLine === null) {
      return badRequest("Ugyldig post.");
    }
    // Vi plukker BARE kjente felter. Ukjente nøkler i payloaden ignoreres,
    // så en klient kan ikke smugle inn f.eks. en egen timerate.
    const l = rawLine as Record<string, unknown>;

    const id = typeof l.id === "string" ? l.id.slice(0, 64) : null;
    if (!id) return badRequest("Post mangler id.");

    const quantity = parseQuantity(l.quantity);
    if (quantity === null) return badRequest("Ugyldig mengde.");

    const entry =
      typeof l.catalogueId === "string"
        ? resolveCatalogueId(l.catalogueId)
        : undefined;

    const line: EstimateRequestLine = {
      id,
      catalogueId: entry?.name,
      description:
        typeof l.description === "string" ? l.description.slice(0, 200) : undefined,
      quantity,
      unit: entry?.unit ?? (typeof l.unit === "string" ? l.unit.slice(0, 8) : "m²"),
      ...readLineOptions(l)
    };
    requestLines.push(line);

    // Arbeidsnøkkel og oppskrift slås opp SERVERSIDE ut fra katalog-ID.
    // Klienten får aldri oppgi dem.
    if (!entry?.workItemKey) continue;
    engineLines.push({
      requestId: id,
      workItemKey: entry.workItemKey,
      materialRecipeKey: entry.materialRecipeKey,
      label: entry.name,
      unit: entry.unit,
      quantity,
      difficulty: line.difficulty,
      options: {
        terraceConstruction: line.terraceConstruction,
        terraceFastening: line.terraceFastening ?? entry.terraceFastening,
        terraceFoundation: line.terraceFoundation,
        ceilingType: line.ceilingType,
        partitionScope: line.partitionScope,
        facadeInsulation: line.facadeInsulation
      }
    });
  }

  try {
    const estimate = toCustomerEstimate(
      requestLines,
      engineLines,
      tier as MaterialTier
    );
    return NextResponse.json<EstimateResponse>(
      { ok: true, estimate },
      { headers: { "cache-control": "no-store" } }
    );
  } catch {
    // Aldri stacktrace, filsti eller konfig ut til kunden.
    return NextResponse.json<EstimateResponse>(
      { ok: false, error: "Kunne ikke beregne estimatet." },
      { status: 500 }
    );
  }
}

/** Kun POST. GET ville invitert til nysgjerrig graving via nettleseren. */
export async function GET() {
  return NextResponse.json<EstimateResponse>(
    { ok: false, error: "Bruk POST." },
    { status: 405, headers: { allow: "POST" } }
  );
}
