import { NextResponse } from "next/server";

import type {
  EstimateRequest,
  EstimateRequestLine,
  EstimateResponse
} from "@/lib/pricing/contract";
import {
  DIFFICULTY_ORDER,
  TERRACE_CONSTRUCTION_ORDER,
  TERRACE_FASTENING_ORDER,
  TERRACE_FOUNDATION_ORDER,
  CEILING_TYPE_ORDER,
  PARTITION_SCOPE_ORDER,
  INSULATION_OPTION_ORDER,
  type MaterialTier
} from "@/lib/pricing/public";
import { resolveCatalogueId } from "@/server/pricing/catalogue";
import { toCustomerEstimate } from "@/server/pricing/toCustomerEstimate";
import type { EstimateLine } from "@/server/pricing/calculateEstimate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Grenser ────────────────────────────────────────────────────── */

const MAX_BODY_BYTES = 16 * 1024;
const MAX_LINES = 40;
const MAX_QUANTITY = 100_000;

/* ── Enkel takstbegrensning ─────────────────────────────────────── */

/**
 * Bøtte per IP i minnet. På serverless deles ikke minnet mellom
 * instanser, så dette er en bremsekloss mot masseuttrekk — ikke en
 * garanti. Grensen er satt høyt nok til at en kunde kan leke seg fritt:
 * 60 kall per minutt er langt mer enn et menneske rekker, men stopper
 * et skript som vil kartlegge hele prismodellen.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
    }
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/* ── Validering ─────────────────────────────────────────────────── */

const oneOf = <T extends string>(list: readonly T[], v: unknown): T | undefined =>
  typeof v === "string" && (list as readonly string[]).includes(v)
    ? (v as T)
    : undefined;

/** Avviser NaN, Infinity, negative og absurde mengder. */
function parseQuantity(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return null;
  if (n > MAX_QUANTITY) return null;
  return n;
}

function badRequest(error: string) {
  return NextResponse.json<EstimateResponse>({ ok: false, error }, { status: 400 });
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "ukjent";

  const limit = rateLimit(ip);
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
      difficulty: oneOf(DIFFICULTY_ORDER, l.difficulty),
      terraceConstruction: oneOf(TERRACE_CONSTRUCTION_ORDER, l.terraceConstruction),
      terraceFastening: oneOf(TERRACE_FASTENING_ORDER, l.terraceFastening),
      terraceFoundation: oneOf(TERRACE_FOUNDATION_ORDER, l.terraceFoundation),
      ceilingType: oneOf(CEILING_TYPE_ORDER, l.ceilingType),
      partitionScope: oneOf(PARTITION_SCOPE_ORDER, l.partitionScope),
      facadeInsulation: oneOf(INSULATION_OPTION_ORDER, l.facadeInsulation)
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
