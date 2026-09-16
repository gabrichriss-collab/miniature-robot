import "server-only";
// Denne modulen inneholder kommersiell prisintelligens og skal ALDRI
// havne i nettleseren. `server-only` gjoer et slikt import til en
// byggefeil i stedet for en stille lekkasje.

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
import type {
  CeilingTypeKey,
  InsulationOptionKey,
  PartitionScopeKey
} from "./labor";

/**
 * Navngitte konstruksjonsforutsetninger. ALLE er markert for godkjenning
 * — de er standard norsk praksis, men de skal bekreftes før publisering.
 */
export const STRUCTURAL_ASSUMPTIONS = {
  /**
   * REFERANSE-senteravstand for bjelkelag under 28 mm terrassebord.
   * Dette er en beregningsforutsetning for estimatet — ikke en regel.
   * Faktisk avstand avhenger av bordprodukt, tykkelse, spennvidde, last,
   * leverandørens anvisning og konstruksjonen for øvrig.
   */
  referenceJoistSpacingMm: 600,
  /** Samme verdi i meter — brukt i utregningene. */
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
  deckingLmPerM2: 8.4,
  /**
   * Løpemeter stående kledning 19×148 rektangulær per m² fasade, før
   * svinn. Referanseprodukt for standard fasadeestimat — betyr ikke at
   * ethvert fasadeprosjekt skal bruke akkurat denne kledningen.
   */
  claddingLmPerM2: 8.13
} as const;

/**
 * VIKTIG FORBEHOLD som skal følge terrasseberegningen hele veien ut til
 * kunden. Mengdene under er estimatorreferanser, ikke prosjektering.
 */
export const TERRACE_STRUCTURAL_CAVEAT =
  "Mengdene for bæresystem er veiledende estimatgrunnlag, ikke " +
  "prosjektering. Faktiske dimensjoner og senteravstander bestemmes av " +
  "spennvidde, last, opplegg og eksisterende konstruksjon.";

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

/** Valg kunden gjør på en enkelt terrasserad. */
export type RecipeOptions = {
  terraceConstruction?: TerraceConstructionKey;
  terraceFastening?: TerraceFasteningKey;
  terraceFoundation?: TerraceFoundationKey;
  ceilingType?: CeilingTypeKey;
  partitionScope?: PartitionScopeKey;
  facadeInsulation?: InsulationOptionKey;
};

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
  /**
   * Komponenter og forbehold som avhenger av valgene på raden
   * (konstruksjonstype, innfesting, fundament).
   */
  dynamic?: (options: RecipeOptions) => {
    components?: MaterialRecipeComponent[];
    pending?: PendingMaterialComponent[];
  };
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


/**
 * Bæresystem, innfesting og fundament for en komplett terrasse.
 * Mengden 48×148 følger konstruksjonstypen kunden har valgt — vi bruker
 * ALDRI ett universelt tall for alle terrasser.
 */
function terraceStructure(options: RecipeOptions): {
  components: MaterialRecipeComponent[];
  pending: PendingMaterialComponent[];
} {
  const construction =
    TERRACE_CONSTRUCTIONS[options.terraceConstruction ?? "standard"];
  const fastening = options.terraceFastening ?? "visible";
  const foundation = options.terraceFoundation ?? "existing";

  const components: MaterialRecipeComponent[] = [
    {
      materialId: "timber_48x148_imp",
      quantityPerUnit: construction.joistLmPerM2,
      assumption: `${construction.label.toLowerCase()} — ${construction.joistLmPerM2} lm/m² 48×148, veiledende estimatgrunnlag`
    }
  ];

  if (fastening === "visible") {
    components.push({
      materialId: "terrace_screws_c4",
      quantityPerUnit: deckScrewsPerM2,
      assumption: `referanse c/c ${STRUCTURAL_ASSUMPTIONS.referenceJoistSpacingMm} mm, ${STRUCTURAL_ASSUMPTIONS.deckScrewsPerCrossing} skruer per bjelkekryss`
    });
  } else {
    // CAMO_PRICE_PENDING — skal ikke prises med C4-skruepris.
    components.push({
      materialId: "terrace_hidden_fastening",
      quantityPerUnit: deckScrewsPerM2,
      assumption: `skjult innfesting, ${deckScrewsPerM2} skruer per m² dekke`
    });
  }

  const pending: PendingMaterialComponent[] = [];
  const f = TERRACE_FOUNDATIONS[foundation];
  if (f.note) pending.push({ label: f.label, reason: f.note });

  return { components, pending };
}

export const MATERIAL_RECIPES: Record<string, MaterialRecipe> = {
  // ══ TERRASSE & UTEROM ═══════════════════════════════════════════════
  terraceDeckingOnly: {
    id: "terraceDeckingOnly",
    unit: "m²",
    status: "assumed",
    components: [],
    tiers: {
      standard: [
        {
          materialId: "terrace_standard_impregnated",
          quantityPerUnit: STRUCTURAL_ASSUMPTIONS.deckingLmPerM2,
          assumption: "8,4 lm terrassebord 28×120 per m² dekke"
        }
      ],
      premium: [
        {
          materialId: "terrace_royal",
          quantityPerUnit: STRUCTURAL_ASSUMPTIONS.deckingLmPerM2,
          assumption: "8,4 lm terrassebord 28×120 per m² dekke"
        }
      ]
    },
    dynamic: (options) => {
      const fastening = options.terraceFastening ?? "visible";
      return {
        components:
          fastening === "visible"
            ? [
                {
                  materialId: "terrace_screws_c4",
                  quantityPerUnit: deckScrewsPerM2,
                  assumption: `referanse c/c ${STRUCTURAL_ASSUMPTIONS.referenceJoistSpacingMm} mm, ${STRUCTURAL_ASSUMPTIONS.deckScrewsPerCrossing} skruer per bjelkekryss`
                }
              ]
            : [
                {
                  materialId: "terrace_hidden_fastening",
                  quantityPerUnit: deckScrewsPerM2,
                  assumption: `skjult innfesting, ${deckScrewsPerM2} skruer per m² dekke`
                }
              ]
      };
    },
    internalNote:
      "Gjelder montering på EKSISTERENDE bjelkelag — derfor ikke bæresystem."
  },

  terraceComplete: {
    id: "terraceComplete",
    unit: "m²",
    status: "assumed",
    components: [],
    tiers: {
      standard: [
        {
          materialId: "terrace_standard_impregnated",
          quantityPerUnit: STRUCTURAL_ASSUMPTIONS.deckingLmPerM2,
          assumption: "8,4 lm terrassebord 28×120 per m² dekke"
        }
      ],
      premium: [
        {
          materialId: "terrace_royal",
          quantityPerUnit: STRUCTURAL_ASSUMPTIONS.deckingLmPerM2,
          assumption: "8,4 lm terrassebord 28×120 per m² dekke"
        }
      ]
    },
    dynamic: terraceStructure,
    customerNote: TERRACE_STRUCTURAL_CAVEAT,
    internalNote:
      "Bæresystem følger konstruksjonstype (3,0 / 3,5 / 4,5 lm/m²). Fundament, rekkverk, trapp og riving er egne poster."
  },

  /**
   * Varianter av terraceComplete som deler ARBEIDSTIMER, men som har en
   * annen materialsammensetning. De arver derfor IKKE terrassens
   * oppskrift — vi finner ikke opp priser på Camo-klips, termofuru,
   * Kebony eller Accoya.
   */
  terraceThermowood: {
    id: "terraceThermowood",
    unit: "m²",
    status: "assumed",
    components: [
      {
        materialId: "terrace_thermowood",
        quantityPerUnit: STRUCTURAL_ASSUMPTIONS.deckingLmPerM2,
        assumption: "8,4 lm termofuru per m² dekke"
      }
    ],
    dynamic: terraceStructure,
    customerNote: TERRACE_STRUCTURAL_CAVEAT,
    internalNote:
      "THERMOWOOD_PRICE_PENDING — Royal-pris skal ikke brukes som erstatning."
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
    internalNote:
      "Enhet er m² (lengde × høyde). Standard oppbygging og kledningstype mangler. Fundament og stolper er egne poster."
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
    status: "assumed",
    components: [
      {
        materialId: "cladding_19x148_rectangular",
        quantityPerUnit: STRUCTURAL_ASSUMPTIONS.claddingLmPerM2,
        assumption:
          "stående kledning 19×148 rektangulær, 8,13 lm per m² fasade før svinn"
      },
      {
        materialId: "wind_barrier",
        quantityPerUnit: 1,
        assumption: "1 m² vindsperre per m² fasade — omlegg dekkes av svinn"
      },
      {
        materialId: "batten_36x48_imp",
        quantityPerUnit: lmPerM2(STRUCTURAL_ASSUMPTIONS.battenSpacingM),
        assumption: `c/c ${STRUCTURAL_ASSUMPTIONS.battenSpacingM * 1000} mm lekteavstand`
      },
      { materialId: "cladding_fasteners", quantityPerUnit: 1 },
      { materialId: "wind_barrier_tape", quantityPerUnit: 1 }
    ],
    // Etterisolering er et VALG — den ligger ikke inne som standard.
    dynamic: (options) => {
      const choice = options.facadeInsulation ?? "none";
      if (choice === "mm100") {
        return {
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
          ]
        };
      }
      if (choice === "other") {
        return {
          pending: [
            {
              label: "Etterisolering",
              reason: "Pris beregnes etter valgt isolasjonstykkelse."
            }
          ]
        };
      }
      return {};
    },
    customerNote:
      "Stillas, vinduer, dører, konstruksjonsreparasjoner og råteskader er egne poster.",
    internalNote:
      "Festemidler og vindsperreteip mangler referansepris — de navngis til de er lagt inn."
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
    status: "assumed",
    components: [
      {
        materialId: "cladding_19x148_rectangular",
        quantityPerUnit: STRUCTURAL_ASSUMPTIONS.claddingLmPerM2,
        assumption:
          "stående kledning 19×148 rektangulær, 8,13 lm per m² fasade før svinn"
      },
      { materialId: "cladding_fasteners", quantityPerUnit: 1 }
    ],
    internalNote:
      "Referanseprodukt. Andre profiler og materialer må få egne oppskrifter."
  },

  exteriorInsulation: {
    id: "exteriorInsulation",
    unit: "m²",
    status: "assumed",
    components: [],
    dynamic: (options) => {
      const choice = options.facadeInsulation ?? "mm100";
      if (choice === "mm100") {
        return {
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
          ]
        };
      }
      return {
        pending: [
          {
            label: "Etterisolering",
            reason: "Pris beregnes etter valgt isolasjonstykkelse."
          }
        ]
      };
    },
    internalNote: "100 mm er standard valgbart alternativ."
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
      }
    ],
    // Reisverk = kun bindingsverk. Komplett = i tillegg isolasjon og ett
    // lag gips på BEGGE sider.
    dynamic: (options) => {
      if ((options.partitionScope ?? "complete") === "framingOnly") return {};
      return {
        components: [
          {
            materialId: "insulation_100mm",
            quantityPerUnit: 1,
            assumption: "isolasjon i full veggtykkelse"
          },
          {
            materialId: "plasterboard_standard",
            quantityPerUnit: 2,
            assumption: "ett lag gips på begge sider — 2 m² per m² vegg"
          }
        ]
      };
    },
    customerNote:
      "Sparkling og maling er ikke inkludert. Elektrikerarbeid, dører og egne lydsystemer kommer i tillegg.",
    internalNote:
      "Reisverk 0,70 t/m² er AVLEDET (1,40 minus 2 × 0,35 gips) — bekreft timetallet."
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
    status: "assumed",
    components: [],
    dynamic: (options) => {
      const type = options.ceilingType ?? "direct";
      if (type === "direct") {
        return {
          components: [
            {
              materialId: "plasterboard_standard",
              quantityPerUnit: 1,
              assumption: "himlingsplate montert direkte i bjelkelaget"
            }
          ]
        };
      }
      if (type === "battened") {
        return {
          components: [
            {
              materialId: "batten_36x48_imp",
              quantityPerUnit: lmPerM2(STRUCTURAL_ASSUMPTIONS.battenSpacingM),
              assumption: `nedlekting c/c ${STRUCTURAL_ASSUMPTIONS.battenSpacingM * 1000} mm`
            },
            { materialId: "plasterboard_standard", quantityPerUnit: 1 }
          ]
        };
      }
      return {
        pending: [
          {
            label: "Nedforet / kompleks himling",
            reason: "Må vurderes etter ønsket nedforing og konstruksjon."
          }
        ]
      };
    },
    internalNote:
      "Tre himlingstyper: direktemontert 0,90 t/m², nedlektet 1,20 t/m², nedforet vurderes."
  },

  flooringInstallation: {
    id: "flooringInstallation",
    unit: "m²",
    status: "assumed",
    // Underlaget er et EGET materiale, ikke gjemt i gulvprisen. Uten
    // verifisert referansepris navngis det i stedet for å bli 0 kr.
    components: [{ materialId: "standard_underlay", quantityPerUnit: 1 }],
    tiers: {
      standard: [{ materialId: "laminate_standard", quantityPerUnit: 1 }],
      premium: [{ materialId: "oak_parquet_standard", quantityPerUnit: 1 }]
    },
    internalNote:
      "UNDERLAY_PRICE_PENDING — både standard_underlay og acoustic_underlay finnes i databasen."
  },

  trimInstallation: {
    id: "trimInstallation",
    unit: "lm",
    status: "assumed",
    components: [{ materialId: "trim_standard", quantityPerUnit: 1 }],
    internalNote:
      "TRIM_PRICE_PENDING — arbeidet regnes, materialprisen avhenger av valgt list."
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
  /**
   * Løpemeter 48×148 trykkimpregnert C24 per m², før svinn.
   * ESTIMATORREFERANSE — inkluderer et konservativt tillegg for bjelker,
   * kantbjelker og kubbing, og for normal variasjon i oppbygging.
   * Ikke prosjektering. Se TERRACE_STRUCTURAL_CAVEAT.
   */
  joistLmPerM2: number;
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
    joistLmPerM2: 3.0
  },
  standard: {
    key: "standard",
    label: "Normal terrasse",
    description: "Vanlig høyde med bjelkelag på punktfundament.",
    laborFactor: 1,
    joistLmPerM2: 3.5
  },
  elevated: {
    key: "elevated",
    label: "Høy / bærende terrasse",
    description: "Stor høyde over terreng, søyler og bæredragere.",
    laborFactor: 1,
    joistLmPerM2: 4.5
  }
};

/* ── INNFESTING ──────────────────────────────────────────────────── */

export type TerraceFasteningKey = "visible" | "hidden";

export const TERRACE_FASTENINGS: Record<
  TerraceFasteningKey,
  { key: TerraceFasteningKey; label: string; description: string }
> = {
  visible: {
    key: "visible",
    label: "Standard synlig innfesting",
    description: "Terrasseskruer gjennom bordet."
  },
  hidden: {
    key: "hidden",
    label: "Skjult innfesting / CAMO",
    description: "Klips eller skråskruing, ingen synlige skruehoder."
  }
};

export const TERRACE_FASTENING_ORDER: TerraceFasteningKey[] = [
  "visible",
  "hidden"
];

/* ── FUNDAMENT ───────────────────────────────────────────────────── */

/**
 * Fundamentering skal ALDRI ligge skjult inne i en universell
 * materialpris per m². Kalkulatoren kjenner ikke grunnforholdene.
 */
export type TerraceFoundationKey = "existing" | "simple" | "assess";

export const TERRACE_FOUNDATIONS: Record<
  TerraceFoundationKey,
  {
    key: TerraceFoundationKey;
    label: string;
    /** Navn på den separate posten, når den utløser en. */
    separateItem?: string;
    /** Kundevendt forklaring. */
    note?: string;
  }
> = {
  existing: {
    key: "existing",
    label: "Eksisterende fundament / ikke nødvendig"
  },
  simple: {
    key: "simple",
    label: "Enkelt fundament",
    separateItem: "Enkelt fundament",
    note:
      "Fundamentet prises som egen post — antall og type punkter " +
      "fastsettes ved befaring."
  },
  assess: {
    key: "assess",
    label: "Fundament må vurderes",
    note:
      "Fundamentering må vurderes etter grunnforhold, høyde og konstruksjon."
  }
};

export const TERRACE_FOUNDATION_ORDER: TerraceFoundationKey[] = [
  "existing",
  "simple",
  "assess"
];

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
