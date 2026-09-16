/**
 * ARBEIDSPRODUKTIVITET — hvor mange timer som går med per enhet.
 *
 * Dette er konfigurerbare startverdier. De skal ALDRI ligge inne i
 * UI-komponenter. Juster tallene her, så følger hele estimatoren etter.
 *
 *   arbeidstimer = mengde × laborHoursPerUnit × vanskelighetsfaktor
 *   arbeidspris  = arbeidstimer × pricingSettings.hourlyRateExVat
 */

export type WorkUnit = "m²" | "lm" | "stk" | "m";

export type WorkCategory =
  | "Terrasse & uterom"
  | "Fasade & kledning"
  | "Vinduer & dører"
  | "Innvendig"
  | "Rehabilitering"
  | "Tilbygg";

export type LaborItem = {
  /** Kortlabel som vises i UI. */
  label: string;
  /** Enhet mengden legges inn i. */
  unit: WorkUnit;
  /** Antall arbeidstimer per enhet. */
  laborHoursPerUnit: number;
  /** Kategori — brukes til gruppering i bla-modalen. */
  category: WorkCategory;
};

/** Bakoverkompatibelt alias. */
export type WorkItem = LaborItem;

export const WORK_ITEMS = {
  // ── TERRASSE & UTEROM ────────────────────────────────────────────
  terraceComplete: {
    label: "Komplett terrasse",
    unit: "m²",
    laborHoursPerUnit: 1.6,
    category: "Terrasse & uterom"
  },
  terraceDeckingOnly: {
    label: "Terrassebord — kun montering",
    unit: "m²",
    laborHoursPerUnit: 0.65,
    category: "Terrasse & uterom"
  },
  terraceDemolition: {
    label: "Riving av eksisterende terrasse",
    unit: "m²",
    laborHoursPerUnit: 0.35,
    category: "Terrasse & uterom"
  },
  terraceRailing: {
    label: "Rekkverk terrasse",
    unit: "lm",
    laborHoursPerUnit: 1.2,
    category: "Terrasse & uterom"
  },
  privacyScreen: {
    label: "Levegg",
    unit: "m²",
    laborHoursPerUnit: 1.0,
    category: "Terrasse & uterom"
  },
  exteriorStairSimple: {
    label: "Enkel utvendig trapp",
    unit: "stk",
    laborHoursPerUnit: 6.0,
    category: "Terrasse & uterom"
  },

  // ── FASADE & KLEDNING ────────────────────────────────────────────
  facadeComplete: {
    label: "Komplett utskifting av kledning",
    unit: "m²",
    laborHoursPerUnit: 2.0,
    category: "Fasade & kledning"
  },
  facadeDemolition: {
    label: "Riving av gammel kledning",
    unit: "m²",
    laborHoursPerUnit: 0.45,
    category: "Fasade & kledning"
  },
  windBarrier: {
    label: "Vindsperre",
    unit: "m²",
    laborHoursPerUnit: 0.25,
    category: "Fasade & kledning"
  },
  facadeBattens: {
    label: "Lekting",
    unit: "m²",
    laborHoursPerUnit: 0.3,
    category: "Fasade & kledning"
  },
  timberCladding: {
    label: "Ny trekledning",
    unit: "m²",
    laborHoursPerUnit: 0.85,
    category: "Fasade & kledning"
  },
  exteriorInsulation: {
    label: "Etterisolering fasade",
    unit: "m²",
    laborHoursPerUnit: 0.55,
    category: "Fasade & kledning"
  },

  // ── VINDUER & DØRER ───────────────────────────────────────────────
  windowReplacement: {
    label: "Bytte standard vindu",
    unit: "stk",
    laborHoursPerUnit: 5.5,
    category: "Vinduer & dører"
  },
  exteriorDoorReplacement: {
    label: "Bytte ytterdør",
    unit: "stk",
    laborHoursPerUnit: 7.0,
    category: "Vinduer & dører"
  },

  // ── INNVENDIG ─────────────────────────────────────────────────────
  interiorPartitionWall: {
    label: "Innvendig skillevegg",
    unit: "m²",
    laborHoursPerUnit: 1.4,
    category: "Innvendig"
  },
  plasterboardSingleLayer: {
    label: "Gips — ett lag",
    unit: "m²",
    laborHoursPerUnit: 0.35,
    category: "Innvendig"
  },
  finishedWallPanel: {
    label: "MDF / ferdig veggplate",
    unit: "m²",
    laborHoursPerUnit: 0.45,
    category: "Innvendig"
  },
  ceilingWork: {
    label: "Himling",
    unit: "m²",
    laborHoursPerUnit: 0.9,
    category: "Innvendig"
  },
  flooringInstallation: {
    label: "Montering gulv",
    unit: "m²",
    laborHoursPerUnit: 0.35,
    category: "Innvendig"
  },
  trimInstallation: {
    label: "Listing",
    unit: "lm",
    laborHoursPerUnit: 0.12,
    category: "Innvendig"
  },

  // ── REHABILITERING (komplekse enkeltrom / etasjer) ───────────────
  rehabilitationLight: {
    label: "Lett rehabilitering",
    unit: "m²",
    laborHoursPerUnit: 1.5,
    category: "Rehabilitering"
  },
  rehabilitationMedium: {
    label: "Middels rehabilitering",
    unit: "m²",
    laborHoursPerUnit: 3.0,
    category: "Rehabilitering"
  },
  rehabilitationHeavy: {
    label: "Omfattende rehabilitering",
    unit: "m²",
    laborHoursPerUnit: 5.0,
    category: "Rehabilitering"
  },

  // ── TILBYGG ───────────────────────────────────────────────────────
  extensionCarpentry: {
    label: "Tilbygg — tømrerarbeid",
    unit: "m²",
    laborHoursPerUnit: 8.5,
    category: "Tilbygg"
  }
} as const satisfies Record<string, LaborItem>;

export type WorkItemKey = keyof typeof WORK_ITEMS;
export type LaborItemKey = WorkItemKey;

/** Alle kategorier i visningsrekkefølge. */
export const WORK_CATEGORIES: WorkCategory[] = [
  "Terrasse & uterom",
  "Fasade & kledning",
  "Vinduer & dører",
  "Innvendig",
  "Rehabilitering",
  "Tilbygg"
];

/** Slå opp timeforbruk. `undefined` når nøkkelen ikke er kartlagt. */
export function laborHoursForItem(key: string): number | undefined {
  return (WORK_ITEMS as Record<string, LaborItem>)[key]?.laborHoursPerUnit;
}

/**
 * PRODUKTIVITETSFAKTOR IKKE KARTLAGT ENNÅ — arbeidsposter som fantes i
 * fuzzy-match-databasen fra tidligere, men som fortsatt trenger
 * beslutning fra Gabriel før de kan prises via arbeidstimer.
 *
 * Disse skal enten:
 *   (a) få en laborHoursPerUnit-verdi og flyttes inn i WORK_ITEMS, eller
 *   (b) fjernes fra estimatoren om de ikke skal tilbys.
 *
 * Foreløpig vises de fortsatt i bla-modalen som "Beregnes ved befaring".
 */
export const WORK_ITEMS_NEEDS_INPUT: Array<{
  key: string;
  label: string;
  unit: WorkUnit | string;
  category: string;
  note: string;
}> = [
  { key: "roofTilesLaying", label: "Taktekking (takstein)", unit: "m²", category: "Tak", note: "Trenger h/m² for taklegging" },
  { key: "roofSteelLaying", label: "Taktekking (stålplater)", unit: "m²", category: "Tak", note: "Trenger h/m²" },
  { key: "guttering", label: "Takrenner", unit: "lm", category: "Tak", note: "Trenger h/lm" },
  { key: "roofInsulation", label: "Etterisolering tak", unit: "m²", category: "Tak", note: "Trenger h/m²" },
  { key: "roofDemolition", label: "Riving av tak", unit: "m²", category: "Tak", note: "Trenger h/m²" },
  { key: "floorParquet", label: "Parkett (heltre)", unit: "m²", category: "Gulv", note: "Kan mappe til flooringInstallation? Bekreft." },
  { key: "floorLaminate", label: "Laminat", unit: "m²", category: "Gulv", note: "Trenger egen h/m² eller mappes til flooringInstallation" },
  { key: "floorTiles", label: "Flislegging (gulv)", unit: "m²", category: "Gulv", note: "Trenger h/m² for flis" },
  { key: "floorVinyl", label: "Vinylgulv", unit: "m²", category: "Gulv", note: "Trenger h/m²" },
  { key: "floorSanding", label: "Sliping av tregulv", unit: "m²", category: "Gulv", note: "Trenger h/m²" },
  { key: "floorDemolition", label: "Riving av gulv", unit: "m²", category: "Gulv", note: "Trenger h/m²" },
  { key: "wallSoundproof", label: "Letvegg — lydvegg (dobbel gips)", unit: "m²", category: "Vegger", note: "Kan mappes til interiorPartitionWall × 1.15 difficulty?" },
  { key: "wallDemolition", label: "Riving av vegg", unit: "m²", category: "Vegger", note: "Trenger h/m²" },
  { key: "tileWall", label: "Flislegging (vegg, våtrom)", unit: "m²", category: "Bad", note: "Trenger h/m²" },
  { key: "paintingExterior", label: "Maling/beising utvendig", unit: "m²", category: "Fasade", note: "Malerarbeid — er dette en tjeneste vi tar?" },
  { key: "largeWindow", label: "Montering vindu (stort)", unit: "stk", category: "Vinduer", note: "Kan mappes til windowReplacement × difficulty?" },
  { key: "patioDoor", label: "Montering terrassedør", unit: "stk", category: "Vinduer", note: "Trenger egen h/stk" },
  { key: "slidingDoor", label: "Montering skyvedør", unit: "stk", category: "Vinduer", note: "Trenger egen h/stk" },
  { key: "windowDoorDemolition", label: "Demontering dør/vindu", unit: "stk", category: "Vinduer", note: "Trenger h/stk" },
  { key: "glassRailing", label: "Rekkverk m/ glass", unit: "lm", category: "Terrasse", note: "Trenger egen h/lm eller mappes til terraceRailing × difficulty" },
  { key: "hiddenFasteningTerrace", label: "Terrasse m/ skjult innfesting", unit: "m²", category: "Terrasse", note: "Variant av terraceComplete + krevende — bekreft" },
  { key: "premiumTerrace", label: "Terrasse m/ termofuru", unit: "m²", category: "Terrasse", note: "Samme h/m² som terraceComplete, høyere materialkost" },
  { key: "interiorStair", label: "Trapp (innvendig)", unit: "stk", category: "Diverse", note: "Trenger h/stk" },
  { key: "shed", label: "Bod/skur", unit: "m²", category: "Diverse", note: "Trenger h/m² — eller mappes til extensionCarpentry?" },
  { key: "scaffolding", label: "Stillas", unit: "m²", category: "Diverse", note: "Infrastruktur, ikke arbeidstimer — flat rate?" },
  { key: "transport", label: "Transport", unit: "tur", category: "Diverse", note: "Flat rate — pass på i beregningen" },
  { key: "wasteManagement", label: "Avfallshåndtering", unit: "stk", category: "Diverse", note: "Materialpost, ikke arbeidstimer" },
  { key: "bathroomMembraneFloor", label: "Membran gulv (våtrom)", unit: "m²", category: "Bad", note: "Trenger h/m²" },
  { key: "bathroomMembraneWall", label: "Membran vegg (våtrom)", unit: "m²", category: "Bad", note: "Trenger h/m²" },
  { key: "underfloorHeating", label: "Gulvvarme (kabler)", unit: "m²", category: "Bad", note: "Elektro — skal vi tilby dette?" },
  { key: "showerNiche", label: "Dusjnisje / dusjhjørne", unit: "stk", category: "Bad", note: "Trenger h/stk" },
  { key: "showerCabinet", label: "Montering dusjkabinett", unit: "stk", category: "Bad", note: "Trenger h/stk" },
  { key: "bathroomJoinery", label: "Bad-innredning (fastmøbler)", unit: "lm", category: "Bad", note: "Trenger h/lm" },
  { key: "toiletInstall", label: "Toalett — montering", unit: "stk", category: "Bad", note: "Rørleggerpost?" },
  { key: "bathtubInstall", label: "Badekar — montering", unit: "stk", category: "Bad", note: "Trenger h/stk" },
  { key: "kitchenStandard", label: "Kjøkkenmontering (standard)", unit: "lm", category: "Kjøkken", note: "Trenger h/lm" },
  { key: "kitchenBespoke", label: "Skreddersydd kjøkken", unit: "lm", category: "Kjøkken", note: "Trenger h/lm — variabel etter design" },
  { key: "counterLaminate", label: "Benkeplate — laminat", unit: "lm", category: "Kjøkken", note: "Trenger h/lm" },
  { key: "counterSolid", label: "Benkeplate — massivtre", unit: "lm", category: "Kjøkken", note: "Trenger h/lm" },
  { key: "counterStone", label: "Benkeplate — stein/kompakt", unit: "lm", category: "Kjøkken", note: "Underleverandør — arbeid vår del?" },
  { key: "ventilator", label: "Ventilator — montering", unit: "stk", category: "Kjøkken", note: "Trenger h/stk" },
  { key: "kitchenTap", label: "Kjøkkenkran — montering", unit: "stk", category: "Kjøkken", note: "Rørleggerpost?" },
  { key: "wardrobeStandard", label: "Garderobe (standard)", unit: "lm", category: "Innredning", note: "Trenger h/lm" },
  { key: "wardrobeBespoke", label: "Skreddersydd garderobe", unit: "lm", category: "Innredning", note: "Trenger h/lm — variabel" },
  { key: "shelvingBespoke", label: "Bokhylle (skreddersydd)", unit: "lm", category: "Innredning", note: "Trenger h/lm" },
  { key: "libraryWall", label: "Bibliotek / vegg-til-vegg", unit: "lm", category: "Innredning", note: "Trenger h/lm" },
  { key: "builtInBench", label: "Innebygd benk", unit: "lm", category: "Innredning", note: "Trenger h/lm" },
  { key: "slidingDoorSystem", label: "Skyvedørssystem", unit: "stk", category: "Innredning", note: "Trenger h/stk" },
  { key: "tvUnit", label: "TV-benk (skreddersydd)", unit: "lm", category: "Innredning", note: "Trenger h/lm" },
  { key: "pergola", label: "Pergola (tre)", unit: "m²", category: "Uterom", note: "Trenger h/m²" },
  { key: "pergolaGlass", label: "Pergola m/ glasstak", unit: "m²", category: "Uterom", note: "Trenger h/m²" },
  { key: "greenhouse", label: "Drivhus — montering", unit: "stk", category: "Uterom", note: "Trenger h/stk" },
  { key: "spaDeck", label: "Spa-terrasse (forsterket)", unit: "m²", category: "Uterom", note: "Variant av terraceComplete + forsterket" },
  { key: "gardenDeck", label: "Utegulv i tre", unit: "m²", category: "Uterom", note: "Kan mappes til terraceComplete-variant" },
  { key: "outdoorShower", label: "Utedusj — innramming", unit: "stk", category: "Uterom", note: "Trenger h/stk" },
  { key: "garage", label: "Garasje (nøkkelferdig)", unit: "m²", category: "Garasje", note: "Trenger h/m² — kan mappes til extensionCarpentry?" },
  { key: "carport", label: "Carport (åpen)", unit: "m²", category: "Garasje", note: "Trenger h/m²" },
  { key: "garageDoorTilting", label: "Garasjeport (vippeport)", unit: "stk", category: "Garasje", note: "Trenger h/stk" },
  { key: "garageDoorSectional", label: "Garasjeport (leddport)", unit: "stk", category: "Garasje", note: "Trenger h/stk" },
  { key: "garageLoft", label: "Loftsbjelker garasje", unit: "m²", category: "Garasje", note: "Trenger h/m²" },
  { key: "plinthFlashing", label: "Sokkelbeslag", unit: "lm", category: "Fasade", note: "Trenger h/lm" },
  { key: "dripBoard", label: "Vannbord (dryppnese)", unit: "lm", category: "Fasade", note: "Trenger h/lm" },
  { key: "roofWindBarrier", label: "Vindsperre tak", unit: "m²", category: "Fasade", note: "Trenger h/m²" },
  { key: "atticInsulation", label: "Etterisolering loft", unit: "m²", category: "Isolasjon", note: "Trenger h/m²" },
  { key: "crawlspaceInsulation", label: "Isolering av kryperom", unit: "m²", category: "Isolasjon", note: "Trenger h/m²" },
  { key: "basementExtInsulation", label: "Kjellervegg — utvendig isolasjon", unit: "m²", category: "Isolasjon", note: "Trenger h/m²" },
  { key: "basementIntInsulation", label: "Kjellervegg — innvendig isolasjon", unit: "m²", category: "Isolasjon", note: "Trenger h/m²" },
  { key: "floorOverColdRoom", label: "Isolering av gulv (over kaldt rom)", unit: "m²", category: "Isolasjon", note: "Trenger h/m²" },
  { key: "rottenLog", label: "Bytte råtne stokker", unit: "stk", category: "Rehab", note: "Vurderes per befaring — forbli 'ved befaring'?" },
  { key: "newFraming", label: "Nytt bindingsverk (vegg)", unit: "m²", category: "Rehab", note: "Trenger h/m²" },
  { key: "newRafters", label: "Nye takstoler / sperrer", unit: "m²", category: "Rehab", note: "Trenger h/m²" },
  { key: "newRoofUnderlay", label: "Nytt undertak", unit: "m²", category: "Rehab", note: "Trenger h/m²" },
  { key: "mullionedWindow", label: "Sprossevindu (kopi)", unit: "stk", category: "Rehab", note: "Trenger h/stk — antikvarisk" },
  { key: "windowRestoration", label: "Restaurering av originalt vindu", unit: "stk", category: "Rehab", note: "Trenger h/stk" },
  { key: "doorRestoration", label: "Restaurering av originaldør", unit: "stk", category: "Rehab", note: "Trenger h/stk" }
];

/* ══════════════════ VALG SOM PÅVIRKER ARBEIDSTIDEN ══════════════════ */

/**
 * Innfesting. Skjult innfesting tar noe lengre tid, men tillegget skal
 * KUN gjelde selve bordmonteringen — ikke hele terrassebyggingen.
 * Rekalibreres når vi har tall fra reelle prosjekter.
 */
export const FASTENING_LABOR_FACTORS = {
  standardVisible: 1.0,
  hiddenCamo: 1.1
} as const;

/**
 * Hvor mange av arbeidspostens timer som er selve bordmonteringen.
 * Innfestingsfaktoren over ganges bare med denne andelen.
 */
export const DECKING_INSTALL_HOURS_PER_UNIT: Record<string, number> = {
  terraceComplete: 0.65,
  terraceDeckingOnly: 0.65,
  terraceThermowood: 0.65
};

export type CeilingTypeKey = "direct" | "battened" | "suspended";

export const CEILING_TYPES: Record<
  CeilingTypeKey,
  {
    key: CeilingTypeKey;
    label: string;
    /** `null` = kan ikke prises automatisk ennå. */
    laborHoursPerUnit: number | null;
    note?: string;
  }
> = {
  direct: {
    key: "direct",
    label: "Direktemontert himling",
    laborHoursPerUnit: 0.9
  },
  battened: {
    key: "battened",
    label: "Nedlektet himling",
    laborHoursPerUnit: 1.2
  },
  suspended: {
    key: "suspended",
    label: "Nedforet / kompleks himling",
    laborHoursPerUnit: null,
    note: "Må vurderes etter ønsket nedforing og konstruksjon."
  }
};

export const CEILING_TYPE_ORDER: CeilingTypeKey[] = [
  "direct",
  "battened",
  "suspended"
];

export type PartitionScopeKey = "framingOnly" | "complete";

export const PARTITION_SCOPES: Record<
  PartitionScopeKey,
  {
    key: PartitionScopeKey;
    label: string;
    laborHoursPerUnit: number;
    note?: string;
  }
> = {
  framingOnly: {
    key: "framingOnly",
    label: "Reisverk / tømrerarbeid",
    // AVLEDET: komplett vegg (1,40) minus to lag gips (2 × 0,35).
    // Bekreft dette timetallet.
    laborHoursPerUnit: 0.7,
    note: "Kun bindingsverk. Plater, isolasjon og overflate kommer i tillegg."
  },
  complete: {
    key: "complete",
    label: "Komplett standard skillevegg",
    laborHoursPerUnit: 1.4,
    note: "Bindingsverk, isolasjon og ett lag gips på begge sider. Sparkling og maling er ikke inkludert."
  }
};

export const PARTITION_SCOPE_ORDER: PartitionScopeKey[] = [
  "framingOnly",
  "complete"
];

export type InsulationOptionKey = "none" | "mm100" | "other";

export const INSULATION_OPTIONS: Record<
  InsulationOptionKey,
  { key: InsulationOptionKey; label: string; thicknessMm: number | null; note?: string }
> = {
  none: { key: "none", label: "Ingen etterisolering", thicknessMm: null },
  mm100: { key: "mm100", label: "100 mm", thicknessMm: 100 },
  other: {
    key: "other",
    label: "Annen tykkelse",
    thicknessMm: null,
    note: "Pris beregnes etter valgt isolasjonstykkelse."
  }
};

export const INSULATION_OPTION_ORDER: InsulationOptionKey[] = [
  "none",
  "mm100",
  "other"
];

/** Valgene en rad kan bære som endrer arbeidstiden. */
export type LaborOptions = {
  terraceFastening?: "visible" | "hidden";
  ceilingType?: CeilingTypeKey;
  partitionScope?: PartitionScopeKey;
};

/**
 * Timer per enhet etter at radens valg er tatt hensyn til.
 *
 *   number     — kan prises
 *   null       — bevisst ikke prisbar ennå; vis tekst, aldri 0 kr
 *   undefined  — ukjent arbeidspost
 */
export function resolveLaborHoursPerUnit(
  workItemKey: string,
  options: LaborOptions = {}
): number | null | undefined {
  if (workItemKey === "ceilingWork") {
    return CEILING_TYPES[options.ceilingType ?? "direct"].laborHoursPerUnit;
  }
  if (workItemKey === "interiorPartitionWall") {
    return PARTITION_SCOPES[options.partitionScope ?? "complete"]
      .laborHoursPerUnit;
  }

  const base = laborHoursForItem(workItemKey);
  if (base == null) return undefined;

  // Skjult innfesting: tillegget gjelder KUN bordmonteringen, ikke hele
  // terrassebyggingen.
  if (options.terraceFastening === "hidden") {
    const decking = DECKING_INSTALL_HOURS_PER_UNIT[workItemKey];
    if (decking != null) {
      const rest = base - decking;
      return (
        Math.round(
          (rest + decking * FASTENING_LABOR_FACTORS.hiddenCamo) * 10000
        ) / 10000
      );
    }
  }
  return base;
}

/** Kundevendt forklaring når arbeidsposten bevisst ikke kan prises. */
export function laborPendingNote(
  workItemKey: string,
  options: LaborOptions = {}
): string | undefined {
  if (workItemKey === "ceilingWork") {
    return CEILING_TYPES[options.ceilingType ?? "direct"].note;
  }
  return undefined;
}
