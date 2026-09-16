/**
 * MATERIALOPPSKRIFTER.
 *
 * Et prosjekt er aldri "areal × pris på den synlige overflaten". En
 * terrasse er ikke bare terrassebord — den er bord, bjelkelag, bæresystem,
 * skruer, småforbruk og fundamentering. Hver arbeidspost får derfor en
 * oppskrift som lister de faktiske komponentene.
 *
 * ──────────────────────────────────────────────────────────────────────
 * REGELEN VI HAR FULGT FOR MENGDER
 *
 *   1. Mengder som følger DIREKTE av én oppgitt avstand eller geometri
 *      (bordforbruk, senteravstand, skruer per kryss) er regnet ut og
 *      merket med forutsetningen i klartekst. Se STRUCTURAL_ASSUMPTIONS.
 *
 *   2. Mengder som avhenger av KONSTRUKSJONSTYPE, spennvidde, last eller
 *      høyde (bæresystem, fundamentering, nedforing) er IKKE gjettet.
 *      De ligger som navngitte, upriset poster i `pending` og flagges
 *      til Gabriel for beslutning.
 *
 * Vi finner ikke opp falsk presisjon. En oppskrift som mangler data får
 * status "pending" og viser tekst i stedet for et tall.
 * ──────────────────────────────────────────────────────────────────────
 */

import type { MaterialTier } from "./settings";

/**
 * Navngitte konstruksjonsforutsetninger. ALLE er markert for godkjenning
 * — de er standard norsk praksis, men de skal bekreftes før publisering.
 */
export const STRUCTURAL_ASSUMPTIONS = {
  /** Senteravstand bjelkelag under 28 mm terrassebord. */
  joistSpacingM: 0.6,
  /** Senteravstand stendere i innvendig bindingsverk. */
  studSpacingM: 0.6,
  /** Senteravstand lekter bak kledning / utvendig påforing. */
  battenSpacingM: 0.6,
  /** Antatt vegghøyde ved beregning av sville og toppsvill. */
  wallHeightM: 2.4,
  /** Terrasseskruer per bordkryss over bjelke. */
  deckScrewsPerCrossing: 2,
  /** Løpemeter terrassebord per m² dekke, 28×120. Oppgitt av Gabriel. */
  deckingLmPerM2: 8.4
} as const;

/**
 * Avrunder avledede forbrukstall slik at flyttallsstøy ikke lekker ut i
 * mengdene (8.4 / 0.6 * 2 skal bli 28, ikke 28.000000000000004).
 */
const round = (n: number, decimals = 4) => {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
};

/** Løpemeter virke per m² flate ved gitt senteravstand. */
const lmPerM2 = (spacingM: number) => round(1 / spacingM);

/** Terrasseskruer per m² dekke: bordkryss over bjelke × skruer per kryss. */
const deckScrewsPerM2 = round(
  (STRUCTURAL_ASSUMPTIONS.deckingLmPerM2 / STRUCTURAL_ASSUMPTIONS.joistSpacingM) *
    STRUCTURAL_ASSUMPTIONS.deckScrewsPerCrossing,
  2
);

export type MaterialRecipeComponent = {
  materialId: string;
  /** Netto forbruk per enhet av arbeidsposten, FØR svinn. */
  quantityPerUnit: number;
  /** Forutsetningen mengden hviler på — vises i detaljert beregning. */
  assumption?: string;
};

/** Navngitt komponent vi bevisst IKKE priser. Vises for kunden. */
export type PendingMaterialComponent = {
  label: string;
  /** Hvorfor mengden ikke kan fastsettes uten mer informasjon. */
  reason: string;
};

/**
 * complete — alle mengder følger av oppgitte data
 * assumed  — regnes fullt ut, men hviler på navngitte forutsetninger
 * partial  — noen komponenter er upriset; summen er et gulv, ikke en total
 * pending  — ingen forsvarlig materialpris ennå; vis tekst i stedet
 * none     — arbeidsposten har reelt ingen materialkostnad (riving)
 */
export type RecipeStatus =
  | "complete"
  | "assumed"
  | "partial"
  | "pending"
  | "none";

export type MaterialRecipe = {
  /** Samme nøkkel som arbeidsposten i WORK_ITEMS. */
  id: string;
  /** Enheten oppskriften regnes per — skal matche arbeidspostens enhet. */
  unit: string;
  status: RecipeStatus;
  /** Komponenter som gjelder uansett materialnivå. */
  components: MaterialRecipeComponent[];
  /**
   * Nivåavhengige komponenter. Finnes `premium` ikke, tilbys kun standard
   * — vi lager ikke premium-valg der det ikke gir mening.
   */
  tiers?: Partial<Record<Exclude<MaterialTier, "none">, MaterialRecipeComponent[]>>;
  /** Navngitte poster vi ikke priser. Gjør "partial" ærlig for kunden. */
  pending?: PendingMaterialComponent[];
  /** Kundevendt forklaring når status er "pending" eller "none". */
  customerNote?: string;
  /** Intern notis til Gabriel. Vises aldri for kunden. */
  internalNote?: string;
};

const WINDOW_DOOR_NOTE =
  "Materialpris avklares etter størrelse og valgt produkt.";
const EXTENSION_NOTE =
  "Materialkostnad beregnes etter valgt konstruksjon og materialstandard.";
const REHAB_NOTE =
  "Materialkostnad avklares etter gjennomgang av eksisterende konstruksjon.";
const DEMOLITION_NOTE =
  "Riving har ingen materialkostnad. Avfallshåndtering avtales separat.";
const DESIGN_DEPENDENT_NOTE =
  "Materialkostnad avhenger av valgt utforming og avklares ved befaring.";

export const MATERIAL_RECIPES: Record<string, MaterialRecipe> = {
  // ══ TERRASSE & UTEROM ═══════════════════════════════════════════════
  terraceDeckingOnly: {
    id: "terraceDeckingOnly",
    unit: "m²",
    status: "assumed",
    components: [
      {
        materialId: "terrace_screws_c4",
        quantityPerUnit: deckScrewsPerM2,
        assumption: `c/c ${STRUCTURAL_ASSUMPTIONS.joistSpacingM * 1000} mm bjelkeavstand, ${STRUCTURAL_ASSUMPTIONS.deckScrewsPerCrossing} skruer per bjelkekryss`
      }
    ],
    tiers: {
      standard: [
        {
          materialId: "decking_28x120_imp",
          quantityPerUnit: STRUCTURAL_ASSUMPTIONS.deckingLmPerM2,
          assumption: "8,4 lm terrassebord 28×120 per m² dekke"
        }
      ],
      premium: [
        {
          materialId: "decking_28x120_royal",
          quantityPerUnit: STRUCTURAL_ASSUMPTIONS.deckingLmPerM2,
          assumption: "8,4 lm terrassebord 28×120 per m² dekke"
        }
      ]
    },
    internalNote:
      "Gjelder montering på EKSISTERENDE bjelkelag. Bekreft skruforbruk 28 stk/m²."
  },

  terraceComplete: {
    id: "terraceComplete",
    unit: "m²",
    status: "partial",
    components: [
      {
        materialId: "terrace_screws_c4",
        quantityPerUnit: deckScrewsPerM2,
        assumption: `c/c ${STRUCTURAL_ASSUMPTIONS.joistSpacingM * 1000} mm bjelkeavstand, ${STRUCTURAL_ASSUMPTIONS.deckScrewsPerCrossing} skruer per bjelkekryss`
      }
    ],
    tiers: {
      standard: [
        {
          materialId: "decking_28x120_imp",
          quantityPerUnit: STRUCTURAL_ASSUMPTIONS.deckingLmPerM2,
          assumption: "8,4 lm terrassebord 28×120 per m² dekke"
        }
      ],
      premium: [
        {
          materialId: "decking_28x120_royal",
          quantityPerUnit: STRUCTURAL_ASSUMPTIONS.deckingLmPerM2,
          assumption: "8,4 lm terrassebord 28×120 per m² dekke"
        }
      ]
    },
    pending: [
      {
        label: "Bjelkelag og bæresystem",
        reason:
          "Forbruk av 48×148 avhenger av spennvidde, konstruksjonstype og høyde."
      },
      {
        label: "Fundamentering",
        reason:
          "Antall og type punkter avhenger av grunnforhold og terrassehøyde."
      }
    ],
    internalNote:
      "TRENGER BESLUTNING: lm 48×148 per m² for lav/normal/høy terrasse, samt fundamenteringsforutsetning."
  },

  /**
   * Varianter av terraceComplete som deler ARBEIDSTIMER, men som har en
   * annen materialsammensetning. De arver derfor IKKE terrassens
   * oppskrift — vi finner ikke opp priser på Camo-klips, termofuru,
   * Kebony eller Accoya.
   */
  terraceHiddenFastening: {
    id: "terraceHiddenFastening",
    unit: "m²",
    status: "pending",
    components: [],
    customerNote:
      "Materialpris avklares etter valgt innfestingssystem og bordtype.",
    internalNote:
      "TRENGER BESLUTNING: referansepris på Camo/skjult innfesting — klips og skruer per m²."
  },

  terraceThermowood: {
    id: "terraceThermowood",
    unit: "m²",
    status: "pending",
    components: [],
    customerNote: "Materialpris avklares etter valgt tresort og dimensjon.",
    internalNote:
      "TRENGER BESLUTNING: referansepris per lm for termofuru / Kebony / Accoya."
  },

  terraceDemolition: {
    id: "terraceDemolition",
    unit: "m²",
    status: "none",
    components: [],
    customerNote: DEMOLITION_NOTE
  },

  terraceRailing: {
    id: "terraceRailing",
    unit: "lm",
    status: "pending",
    components: [],
    customerNote: DESIGN_DEPENDENT_NOTE,
    internalNote:
      "TRENGER BESLUTNING: standard rekkverksoppbygging — stolpeavstand, håndløper, spiler eller glass."
  },

  privacyScreen: {
    id: "privacyScreen",
    unit: "m²",
    status: "pending",
    components: [],
    customerNote: DESIGN_DEPENDENT_NOTE,
    internalNote: "TRENGER BESLUTNING: standard leveggoppbygging og kledningstype."
  },

  exteriorStairSimple: {
    id: "exteriorStairSimple",
    unit: "stk",
    status: "pending",
    components: [],
    customerNote: DESIGN_DEPENDENT_NOTE,
    internalNote: "TRENGER BESLUTNING: standard trappeoppbygging — antall trinn, bredde, vanger."
  },

  // ══ FASADE & KLEDNING ═══════════════════════════════════════════════
  facadeComplete: {
    id: "facadeComplete",
    unit: "m²",
    status: "partial",
    components: [
      {
        materialId: "wind_barrier",
        quantityPerUnit: 1,
        assumption: "1 m² vindsperre per m² fasade — omlegg dekkes av svinn"
      },
      {
        materialId: "batten_36x48_imp",
        quantityPerUnit: lmPerM2(STRUCTURAL_ASSUMPTIONS.battenSpacingM),
        assumption: `c/c ${STRUCTURAL_ASSUMPTIONS.battenSpacingM * 1000} mm lekteavstand`
      }
    ],
    pending: [
      {
        label: "Ny trekledning",
        reason:
          "Materialpris avhenger av valgt kledningsprofil, dimensjon og overflatebehandling."
      }
    ],
    internalNote:
      "TRENGER BESLUTNING: hvilken kledningsprofil er standard? Referansepris per lm eller m²."
  },

  facadeDemolition: {
    id: "facadeDemolition",
    unit: "m²",
    status: "none",
    components: [],
    customerNote: DEMOLITION_NOTE
  },

  windBarrier: {
    id: "windBarrier",
    unit: "m²",
    status: "complete",
    components: [
      {
        materialId: "wind_barrier",
        quantityPerUnit: 1,
        assumption: "1 m² per m² fasade — omlegg dekkes av svinn"
      }
    ]
  },

  facadeBattens: {
    id: "facadeBattens",
    unit: "m²",
    status: "assumed",
    components: [
      {
        materialId: "batten_36x48_imp",
        quantityPerUnit: lmPerM2(STRUCTURAL_ASSUMPTIONS.battenSpacingM),
        assumption: `c/c ${STRUCTURAL_ASSUMPTIONS.battenSpacingM * 1000} mm lekteavstand`
      }
    ]
  },

  timberCladding: {
    id: "timberCladding",
    unit: "m²",
    status: "pending",
    components: [],
    customerNote:
      "Materialpris avklares etter valgt kledningsprofil og overflatebehandling.",
    internalNote:
      "TRENGER BESLUTNING: standard kledningsprofil mangler i materialdatabasen."
  },

  exteriorInsulation: {
    id: "exteriorInsulation",
    unit: "m²",
    status: "assumed",
    components: [
      {
        materialId: "insulation_100mm",
        quantityPerUnit: 1,
        assumption: "100 mm etterisolering, 1 m² per m² fasade"
      },
      {
        materialId: "timber_48x98_imp",
        quantityPerUnit: lmPerM2(STRUCTURAL_ASSUMPTIONS.battenSpacingM),
        assumption: `påforing 48×98 c/c ${STRUCTURAL_ASSUMPTIONS.battenSpacingM * 1000} mm`
      }
    ],
    internalNote:
      "Bekreft at 100 mm er standard etterisoleringstykkelse i tilbudene våre."
  },

  // ══ VINDUER & DØRER ═════════════════════════════════════════════════
  windowReplacement: {
    id: "windowReplacement",
    unit: "stk",
    status: "pending",
    components: [],
    customerNote: WINDOW_DOOR_NOTE,
    internalNote:
      "Bevisst upriset: varierer for mye med mål, åpningstype, glass, materiale og produsent."
  },

  exteriorDoorReplacement: {
    id: "exteriorDoorReplacement",
    unit: "stk",
    status: "pending",
    components: [],
    customerNote: WINDOW_DOOR_NOTE,
    internalNote: "Bevisst upriset — samme begrunnelse som vindu."
  },

  // ══ INNVENDIG ═══════════════════════════════════════════════════════
  interiorPartitionWall: {
    id: "interiorPartitionWall",
    unit: "m²",
    status: "assumed",
    components: [
      {
        materialId: "timber_48x98_imp",
        quantityPerUnit: round(
          lmPerM2(STRUCTURAL_ASSUMPTIONS.studSpacingM) +
            2 / STRUCTURAL_ASSUMPTIONS.wallHeightM
        ),
        assumption: `stendere c/c ${STRUCTURAL_ASSUMPTIONS.studSpacingM * 1000} mm + sville og toppsvill ved ${STRUCTURAL_ASSUMPTIONS.wallHeightM} m vegghøyde`
      },
      {
        materialId: "plasterboard_standard",
        quantityPerUnit: 2,
        assumption: "ett lag gips på begge sider"
      },
      {
        materialId: "insulation_100mm",
        quantityPerUnit: 1,
        assumption: "isolasjon i full veggtykkelse"
      }
    ],
    internalNote:
      "BEKREFT OMFANG: inkluderer skilleveggen gips og isolasjon, eller kun bindingsverk?"
  },

  plasterboardSingleLayer: {
    id: "plasterboardSingleLayer",
    unit: "m²",
    status: "complete",
    components: [
      { materialId: "plasterboard_standard", quantityPerUnit: 1 }
    ]
  },

  finishedWallPanel: {
    id: "finishedWallPanel",
    unit: "m²",
    status: "complete",
    components: [{ materialId: "mdf_wall_panel", quantityPerUnit: 1 }]
  },

  ceilingWork: {
    id: "ceilingWork",
    unit: "m²",
    status: "partial",
    components: [
      { materialId: "plasterboard_standard", quantityPerUnit: 1 }
    ],
    pending: [
      {
        label: "Underlag / nedforing",
        reason:
          "Avhenger av om himlingen festes direkte i bjelkelaget eller fores ned."
      }
    ],
    internalNote:
      "TRENGER BESLUTNING: er direktemontert himling standard, eller nedforet? Lekteforbruk følger av valget."
  },

  flooringInstallation: {
    id: "flooringInstallation",
    unit: "m²",
    status: "partial",
    components: [],
    tiers: {
      standard: [{ materialId: "laminate_standard", quantityPerUnit: 1 }],
      premium: [{ materialId: "oak_parquet_standard", quantityPerUnit: 1 }]
    },
    pending: [
      {
        label: "Undergulv og trinnlydsmatte",
        reason: "Ikke lagt inn i materialdatabasen ennå."
      }
    ],
    internalNote:
      "TRENGER BESLUTNING: referansepris per m² for trinnlydsmatte/undergulv."
  },

  trimInstallation: {
    id: "trimInstallation",
    unit: "lm",
    status: "pending",
    components: [],
    customerNote:
      "Materialpris avklares etter valgt listtype og overflatebehandling.",
    internalNote:
      "TRENGER BESLUTNING: referansepris per lm for standard gulv-, tak- og dørlist."
  },

  // ══ REHABILITERING ══════════════════════════════════════════════════
  rehabilitationLight: {
    id: "rehabilitationLight",
    unit: "m²",
    status: "pending",
    components: [],
    customerNote: REHAB_NOTE
  },
  rehabilitationMedium: {
    id: "rehabilitationMedium",
    unit: "m²",
    status: "pending",
    components: [],
    customerNote: REHAB_NOTE
  },
  rehabilitationHeavy: {
    id: "rehabilitationHeavy",
    unit: "m²",
    status: "pending",
    components: [],
    customerNote: REHAB_NOTE
  },

  // ══ TILBYGG ═════════════════════════════════════════════════════════
  extensionCarpentry: {
    id: "extensionCarpentry",
    unit: "m²",
    status: "pending",
    components: [],
    customerNote: EXTENSION_NOTE,
    internalNote:
      "Datamodellen er klar for oppskrifter: fundament, gulv, vegg, isolasjon, tak, vindu, dør, kledning, innvendig."
  }
};

/**
 * Oppskrifter som ikke har en egen arbeidspost, men er materialvarianter
 * av en. Brukes av testen som sjekker at enheter stemmer overens.
 */
export const RECIPE_VARIANTS: Record<string, string> = {
  terraceHiddenFastening: "terraceComplete",
  terraceThermowood: "terraceComplete"
};

export function getRecipe(workItemKey: string): MaterialRecipe | undefined {
  return MATERIAL_RECIPES[workItemKey];
}

/** Hvilke materialnivåer arbeidsposten faktisk tilbyr. */
export function availableTiers(
  workItemKey: string
): Array<Exclude<MaterialTier, "none">> {
  const recipe = MATERIAL_RECIPES[workItemKey];
  if (!recipe?.tiers) return [];
  return (["standard", "premium"] as const).filter((t) => recipe.tiers?.[t]);
}

/**
 * TERRASSE — KONSTRUKSJONSTYPE.
 *
 * Én universell materialpris per m² terrasse er ikke teknisk forsvarlig.
 * Strukturen er på plass, men vi legger IKKE inn oppdiktede
 * bæresystem- eller fundamenteringsmengder. Feltene under fylles når
 * Gabriel har bestemt forutsetningene per type.
 */
export type TerraceConstructionKey = "ground" | "standard" | "elevated";

export type TerraceConstruction = {
  key: TerraceConstructionKey;
  label: string;
  description: string;
  /** Multiplikator på arbeidstimer. 1.0 til vi har grunnlag for noe annet. */
  laborFactor: number;
  /** lm 48×148 per m². `null` = ikke fastsatt ennå. */
  joistLmPerM2: number | null;
  /** lm bæredrager per m². `null` = ikke fastsatt ennå. */
  beamLmPerM2: number | null;
  /** Fundamentpunkter per m². `null` = ikke fastsatt ennå. */
  foundationPointsPerM2: number | null;
};

export const TERRACE_CONSTRUCTIONS: Record<
  TerraceConstructionKey,
  TerraceConstruction
> = {
  ground: {
    key: "ground",
    label: "Lav / markterrasse",
    description: "Ligger tett på bakken, ingen eller svært lav understøtting.",
    laborFactor: 1,
    joistLmPerM2: null,
    beamLmPerM2: null,
    foundationPointsPerM2: null
  },
  standard: {
    key: "standard",
    label: "Normal terrasse",
    description: "Vanlig høyde med bjelkelag på punktfundament.",
    laborFactor: 1,
    joistLmPerM2: null,
    beamLmPerM2: null,
    foundationPointsPerM2: null
  },
  elevated: {
    key: "elevated",
    label: "Høy / bærende terrasse",
    description: "Stor høyde over terreng, søyler og bæredragere.",
    laborFactor: 1,
    joistLmPerM2: null,
    beamLmPerM2: null,
    foundationPointsPerM2: null
  }
};

export const TERRACE_CONSTRUCTION_ORDER: TerraceConstructionKey[] = [
  "ground",
  "standard",
  "elevated"
];

/** Arbeidsposter der konstruksjonsvalget er relevant. */
export const TERRACE_WORK_ITEMS = [
  "terraceComplete",
  "terraceDeckingOnly"
] as const;

/**
 * SAMLET LISTE OVER ÅPNE BESLUTNINGER.
 * Genereres fra oppskriftene slik at den aldri kommer ut av synk.
 */
export function pendingMaterialDecisions(): Array<{
  workItemKey: string;
  status: RecipeStatus;
  items: string[];
  internalNote?: string;
}> {
  return Object.values(MATERIAL_RECIPES)
    .filter((r) => r.status === "partial" || r.status === "pending")
    .map((r) => ({
      workItemKey: r.id,
      status: r.status,
      items: (r.pending ?? []).map((p) => `${p.label} — ${p.reason}`),
      internalNote: r.internalNote
    }));
}
