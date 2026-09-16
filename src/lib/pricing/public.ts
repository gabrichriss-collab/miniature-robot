/**
 * KUNDESIKKER PRISKONFIGURASJON.
 *
 * Alt i denne fila havner i nettleseren. Derfor inneholder den KUN
 * etiketter, enum-verdier og typer — ingen timerate, ingen
 * produktivitetstall, ingen materialpriser, ingen forbruksmengder,
 * ingen svinn, ingen prisbuffer og ingen multiplikatorer.
 *
 * Alle tall bor i `src/server/pricing/*`, bak `import "server-only"`.
 * Trenger du et tall her, er svaret nesten alltid at beregningen skal
 * skje i API-et i stedet.
 */

/* ── Enum-verdier som sendes til API-et ─────────────────────────── */

export type DifficultyKey = "normal" | "difficult" | "veryDifficult";
export type MaterialTier = "none" | "standard" | "premium";
export type TerraceConstructionKey = "ground" | "standard" | "elevated";
export type TerraceFasteningKey = "visible" | "hidden";
export type TerraceFoundationKey = "existing" | "simple" | "assess";
export type CeilingTypeKey = "direct" | "battened" | "suspended";
export type PartitionScopeKey = "framingOnly" | "complete";
export type InsulationOptionKey = "none" | "mm100" | "other";

/* ── Etiketter til UI ───────────────────────────────────────────── */

export const DIFFICULTY_LABELS: Record<DifficultyKey, string> = {
  normal: "Normal tilkomst",
  difficult: "Krevende tilkomst",
  veryDifficult: "Svært krevende tilkomst"
};

export const MATERIAL_TIER_LABELS: Record<MaterialTier, string> = {
  none: "Kun arbeid",
  standard: "Standard materialer",
  premium: "Premium materialer"
};

export const TERRACE_CONSTRUCTION_LABELS: Record<TerraceConstructionKey, string> = {
  ground: "Lav / markterrasse",
  standard: "Normal terrasse",
  elevated: "Høy / bærende terrasse"
};

export const TERRACE_FASTENING_LABELS: Record<TerraceFasteningKey, string> = {
  visible: "Standard synlig innfesting",
  hidden: "Skjult innfesting / CAMO"
};

export const TERRACE_FOUNDATION_LABELS: Record<TerraceFoundationKey, string> = {
  existing: "Eksisterende fundament / ikke nødvendig",
  simple: "Enkelt fundament",
  assess: "Fundament må vurderes"
};

export const CEILING_TYPE_LABELS: Record<CeilingTypeKey, string> = {
  direct: "Direktemontert himling",
  battened: "Nedlektet himling",
  suspended: "Nedforet / kompleks himling"
};

export const PARTITION_SCOPE_LABELS: Record<PartitionScopeKey, string> = {
  framingOnly: "Reisverk / tømrerarbeid",
  complete: "Komplett standard skillevegg"
};

export const INSULATION_OPTION_LABELS: Record<InsulationOptionKey, string> = {
  none: "Ingen etterisolering",
  mm100: "100 mm",
  other: "Annen tykkelse"
};

export const DIFFICULTY_ORDER: DifficultyKey[] = [
  "normal",
  "difficult",
  "veryDifficult"
];
export const TERRACE_CONSTRUCTION_ORDER: TerraceConstructionKey[] = [
  "ground",
  "standard",
  "elevated"
];
export const TERRACE_FASTENING_ORDER: TerraceFasteningKey[] = ["visible", "hidden"];
export const TERRACE_FOUNDATION_ORDER: TerraceFoundationKey[] = [
  "existing",
  "simple",
  "assess"
];
export const CEILING_TYPE_ORDER: CeilingTypeKey[] = [
  "direct",
  "battened",
  "suspended"
];
export const PARTITION_SCOPE_ORDER: PartitionScopeKey[] = [
  "framingOnly",
  "complete"
];
export const INSULATION_OPTION_ORDER: InsulationOptionKey[] = [
  "none",
  "mm100",
  "other"
];

/**
 * Mva-satsen er offentlig norsk lov, ikke forretningshemmelighet. Den
 * ligger her bare for å kunne skrive «MVA (25 %)» i grensesnittet —
 * selve mva-beregningen skjer serverside.
 */
export const VAT_PERCENT_DISPLAY = 25;

export const ESTIMATE_DISCLAIMER =
  "Dette er et veiledende prisestimat basert på opplysningene du har lagt " +
  "inn, standard beregnet arbeidstid og veiledende materialpriser. Faktisk " +
  "pris kan variere på grunn av eksisterende konstruksjon, tilkomst, " +
  "materialvalg, leverandørpriser og forhold som først kan vurderes ved " +
  "gjennomgang eller befaring.";

export const ESTIMATE_DISCLAIMER_CLOSING =
  "Endelig pris fastsettes i et skriftlig tilbud.";

/* ── Hvilke valggrupper som gjelder hvilke arbeidsposter ────────── */

export const TERRACE_WORK_ITEMS = ["terraceComplete", "terraceDeckingOnly"] as const;
export const CEILING_WORK_ITEM = "ceilingWork";
export const PARTITION_WORK_ITEM = "interiorPartitionWall";
export const INSULATION_WORK_ITEMS = ["facadeComplete", "exteriorInsulation"] as const;

/* ── Offentlig katalogpost ──────────────────────────────────────── */

/**
 * Det nettleseren får vite om en post i prislista: hva den heter, hvilken
 * enhet den måles i og hva som er inkludert. Ikke timeforbruk, ikke
 * kroner, ikke oppskrift.
 */
export type CatalogueItem = {
  /** Stabil ID. Sendes til API-et; sier ingenting om priser. */
  id: string;
  name: string;
  unit: string;
  category: string;
  note?: string;
  /** Søkeord for fritekstmatching i nettleseren. */
  keywords: string[];
  /** Kan posten prises av motoren i det hele tatt? */
  priceable: boolean;
  /** Finnes et premium-materialnivå for denne posten? */
  hasPremium: boolean;
  /**
   * Hvilke valggrupper posten bruker: "difficulty", "terrace",
   * "ceiling", "partition", "insulation". Styrer hvilke felt UI tegner.
   * Sier ingenting om hva valgene gjoer med prisen.
   */
  optionGroups: string[];
};

/** Enheter kunden kan velge for fritekstposter. Ren UI-liste. */
export const UNITS = [
  "m²",
  "m",
  "lm",
  "stk",
  "RS",
  "tur",
  "timer",
  "pak",
  "kg"
] as const;
export type UnitOption = (typeof UNITS)[number];
