import "server-only";
// Intern prisresearch. Skal ALDRI havne i nettleseren, i et offentlig
// API-svar eller i kundens PDF.

/**
 * REFERANSEPRIS-REGISTERET — skjema.
 *
 * Registeret holder eksterne referansepriser (f.eks. fra et
 * kalkulasjonsverktøy) som INTERN RESEARCH. De er ikke våre priser, og
 * de brukes aldri direkte som kundesatser. De sammenlignes med vår egen
 * modell (arbeidstimer × timerate + materialoppskrifter) for å finne
 * avvik som er verdt å undersøke.
 *
 * Lisens: referansedata fra tredjepart lagres IKKE i git — repoet er
 * offentlig. Selve postene ligger i en gitignorert fil (se registry.ts).
 * Det som er committet her er bare skjema, validering og verktøy.
 *
 * Tre-verdi-logikk: det vi ikke vet, står som "UNKNOWN". Aldri true/false
 * på gjetning, og aldri undefined som stille betyr "nei".
 */

/** Kjente kilder. Utvides når nye kilder legges inn. */
export const REFERENCE_SOURCES = ["EG_HOLTE_SMARTKALK"] as const;
export type ReferenceSource = (typeof REFERENCE_SOURCES)[number];

export const REFERENCE_CATEGORIES = [
  "ROOF",
  "ROOF_WINDOWS_DRAINAGE",
  "FACADE_WALL",
  "TERRACE_OUTDOOR",
  "GROUNDWORK_SPECIALIST"
] as const;
export type ReferenceCategory = (typeof REFERENCE_CATEGORIES)[number];

export const REFERENCE_UNITS = ["m²", "lm", "stk"] as const;
export type ReferenceUnit = (typeof REFERENCE_UNITS)[number];

/** Er prisen oppgitt eks. eller inkl. mva? UNKNOWN til det er sjekket. */
export const VAT_BASES = ["UNKNOWN", "EX_VAT", "INC_VAT"] as const;
export type VatBasis = (typeof VAT_BASES)[number];

/** Tre-verdi: inngår arbeid / materialer / påslag i prisen? */
export const TRI_STATES = ["YES", "NO", "UNKNOWN"] as const;
export type TriState = (typeof TRI_STATES)[number];

/** Er det verifisert hva som inngår i elementprisen? */
export const INCLUSION_STATUSES = ["UNVERIFIED", "VERIFIED"] as const;
export type InclusionStatus = (typeof INCLUSION_STATUSES)[number];

/**
 * Hva prisen kan brukes til.
 * REFERENCE_ONLY — kun intern sammenligning. Aldri kundesats.
 * VALIDATED      — kontrollert av eier; KAN vurderes som grunnlag for
 *                  en endring i vår egen modell (som da gjøres i
 *                  labor.ts / materials.ts, ikke her).
 * RETIRED        — utgått, beholdes for historikk.
 */
export const PRICE_STATUSES = ["REFERENCE_ONLY", "VALIDATED", "RETIRED"] as const;
export type PriceStatus = (typeof PRICE_STATUSES)[number];

/**
 * Postens samlede verifiseringsstatus. Holdes adskilt fra priceStatus
 * med vilje: en post kan være verifisert (vi vet hva den er) og likevel
 * bare være referanse (vi bruker den ikke som sats).
 */
export const VERIFICATION_STATUSES = [
  "REFERENCE_UNVERIFIED",
  "REFERENCE_VERIFIED"
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/**
 * Hvordan en referansepost kan sammenlignes med en av våre arbeidsposter.
 * NOT_COMPARABLE betyr at posten ikke skal sammenlignes i det hele tatt —
 * f.eks. takterrasse mot vanlig terrasse.
 */
export const COMPARABILITIES = ["SCOPE_DIFFERS", "PARTIAL", "NOT_COMPARABLE"] as const;
export type Comparability = (typeof COMPARABILITIES)[number];

/**
 * Omfangsdimensjonene som MÅ skilles når en elementpris sammenlignes
 * med vår modell. Rekkefølgen er den rapporten bruker.
 */
export const SCOPE_DIMENSIONS = [
  "constructionScope",
  "groundPreparation",
  "structuralFramework",
  "foundations",
  "deckingMaterial",
  "railing",
  "stairs",
  "demolition",
  "waste",
  "vat",
  "laborInclusion",
  "materialsInclusion",
  // Ikke blant de tolv eier listet for terrassen, men nødvendig for
  // regelen «isolasjon skal ikke legges på to ganger».
  "insulation"
] as const;
export type ScopeDimension = (typeof SCOPE_DIMENSIONS)[number];

/** Én dimensjon: inngår den, og hva bygger vi det på? */
export type ScopeValue = { value: TriState; basis: string };
export type ScopeMatrix = Record<ScopeDimension, ScopeValue>;

/** Kobling fra en referansepost til en av våre arbeidsposter. */
export type ModelMapping = {
  workItemKey: string;
  materialRecipeKey?: string;
  /**
   * Valg på vår post som gjør sammenligningen mest rettferdig
   * (f.eks. etterisolering 100 mm). Samme nøkler som RecipeOptions.
   */
  options?: Record<string, string>;
  comparability: Comparability;
  /** Hvorfor koblingen er (eller ikke er) sammenlignbar. */
  reason: string;
};

export type ReferencePriceRecord = {
  /** Vår egen stabile ID. Unik i hele registeret. */
  internalId: string;
  source: ReferenceSource;
  /** Kildens egen elementkode. */
  sourceCode: string;
  /**
   * Alternativ/variant innenfor samme elementkode. Påkrevd når flere
   * poster deler sourceCode — da skal hver variant ha sin egen ID.
   */
  sourceVariant: string | null;
  /**
   * True når sourceVariant er en ID VI har satt, fordi kildens egen
   * variant-ID ikke var tilgjengelig. Skal byttes ut med kildens ID.
   */
  sourceVariantIsLocal: boolean;
  description: string;
  category: ReferenceCategory;
  unit: ReferenceUnit;
  /** Prisen slik kilden oppgir den. Mva-grunnlag: se vatBasis. */
  referencePriceNok: number;
  vatBasis: VatBasis;
  /** ISO-dato for når prisen ble hentet. */
  capturedDate: string;
  inclusionStatus: InclusionStatus;
  includesLabor: TriState;
  includesMaterials: TriState;
  includesOverhead: TriState;
  priceStatus: PriceStatus;
  verificationStatus: VerificationStatus;
  /** Forutsetninger kilden oppgir, eller som må gjelde for sammenligning. */
  applicableConditions: string[];
  /** Arbeid som er kjent å IKKE inngå. Tom liste = ikke kartlagt. */
  excludedWork: string[];
  /**
   * Arbeid som krever prosjektering, fagkompetanse eller er regulert
   * (bærende konstruksjon, tak/membran, grunnarbeid). Slike poster skal
   * aldri presenteres som et komplett tilbud.
   */
  requiresProfessionalAssessment: boolean;
  /** Hva prisen bygger på (skjermbilde, dokument, eget notat). */
  evidence: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string;
  /** Koblinger til vår modell. Tom liste = ikke sammenlignbar ennå. */
  modelMappings: ModelMapping[];
  /** Omfang for KILDENS pris. Utelatt = alt UNKNOWN. */
  scope?: Partial<ScopeMatrix>;
};

/** Filformatet registeret leses fra. */
export type ReferenceFile = {
  /** Skjemaversjon — økes ved brytende endringer. */
  schemaVersion: 1;
  /** Kort beskrivelse av hva filen er. */
  description: string;
  records: ReferencePriceRecord[];
};
