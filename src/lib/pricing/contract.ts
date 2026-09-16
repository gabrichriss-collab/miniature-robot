/**
 * KONTRAKTEN MELLOM NETTLESER OG SERVER.
 *
 * Forespoerselen inneholder kundens VALG — aldri priser, timer eller
 * faktorer. Svaret inneholder RESULTATET — aldri oppskriften bak det.
 *
 * Legger du til et felt her: spoer om en konkurrent kan lese
 * forretningsmodellen ut av det. Kan de det, hoerer feltet hjemme
 * serverside.
 */

import type {
  CeilingTypeKey,
  DifficultyKey,
  InsulationOptionKey,
  MaterialTier,
  PartitionScopeKey,
  TerraceConstructionKey,
  TerraceFasteningKey,
  TerraceFoundationKey
} from "./public";

/* ── Forespoersel ───────────────────────────────────────────────── */

export type EstimateRequestLine = {
  /** Klientens egen rad-ID, bare for å pare svaret med riktig rad. */
  id: string;
  /** Offentlig katalog-ID, eller utelatt for fritekstrad. */
  catalogueId?: string;
  /** Fritekst kunden skrev, når ingen katalogpost er valgt. */
  description?: string;
  quantity: number;
  unit: string;
  difficulty?: DifficultyKey;
  terraceConstruction?: TerraceConstructionKey;
  terraceFastening?: TerraceFasteningKey;
  terraceFoundation?: TerraceFoundationKey;
  ceilingType?: CeilingTypeKey;
  partitionScope?: PartitionScopeKey;
  facadeInsulation?: InsulationOptionKey;
};

export type EstimateRequest = {
  lines: EstimateRequestLine[];
  materialTier: MaterialTier;
};

/* ── Svar ───────────────────────────────────────────────────────── */

/** Én linje slik KUNDEN ser den. Ingen timer, ingen enhetspriser. */
export type CustomerEstimateLine = {
  id: string;
  label: string;
  unit: string;
  quantity: number;
  /** Arbeid for linja, eks. mva. */
  laborExVat: number;
  /** Materialer for linja i valgt nivå, eks. mva. */
  materialExVat: number;
  /** Er materialkurven komplett for denne linja? */
  materialComplete: boolean;
  /** Navngitte poster som bevisst ikke er priset. */
  notIncluded: string[];
  /** Arbeidet kan ikke beregnes automatisk ennå. */
  laborPending: boolean;
  pendingNote?: string;
  /** Valgene kunden gjorde, i klartekst — for kvittering i UI. */
  chosenOptions: string[];
};

export type CustomerScenario = {
  tier: MaterialTier;
  label: string;
  available: boolean;
  laborExVat: number;
  materialExVat: number;
  subtotalExVat: number;
  vat: number;
  totalIncVat: number;
  range: { low: number; high: number };
  materialEstimateComplete: boolean;
};

export type CustomerEstimateSummary = {
  lines: CustomerEstimateLine[];
  scenarios: Record<MaterialTier, CustomerScenario>;
  selectedTier: MaterialTier;
  materialsAvailable: boolean;
  premiumAvailable: boolean;
  hasPendingLabor: boolean;
  /** Poster der materialkostnaden avklares senere. */
  unpriced: Array<{ label: string; note: string }>;
  vatPercent: number;
};

export type EstimateResponse =
  | { ok: true; estimate: CustomerEstimateSummary }
  | { ok: false; error: string };
