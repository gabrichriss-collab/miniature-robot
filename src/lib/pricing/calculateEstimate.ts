/**
 * SAMLEMOTOREN.
 *
 *   prosjekt eks. mva = arbeid + materialer
 *   mva               = prosjekt eks. mva × 25 %
 *   prosjekt inkl. mva = prosjekt eks. mva + mva
 *
 * Arbeid og materialer regnes hver for seg, begge normalisert til eks.
 * mva, og mva legges på til slutt. Vi blander aldri mva-belagte
 * materialtall direkte inn i arbeidspriser.
 *
 * Motoren produserer tre scenarier samtidig — KUN ARBEID, STANDARD og
 * PREMIUM — slik at UI-et bare velger hvilket som vises.
 */

import {
  pricingSettings,
  MATERIAL_TIER_LABELS,
  type DifficultyKey,
  type MaterialTier
} from "../../config/pricing/settings";
import {
  availableTiers,
  getRecipe,
  type RecipeOptions
} from "../../config/pricing/recipes";
import {
  calcLaborTotal,
  round2,
  type LaborLineInput,
  type LaborTotal
} from "./calculateLabor";
import {
  calcMaterialTotal,
  recipeKeyFor,
  type MaterialTotal
} from "./calculateMaterials";
import { roundForDisplay } from "./format";

export type EstimateLine = {
  workItemKey?: string;
  /** Se `MaterialLineInput.materialRecipeKey`. */
  materialRecipeKey?: string;
  label: string;
  unit: string;
  quantity: number | string;
  difficulty?: DifficultyKey;
  /** Valg på raden som påvirker materialoppskriften. */
  options?: RecipeOptions;
};

export type EstimateScenario = {
  tier: MaterialTier;
  label: string;
  /** Om dette scenariet i det hele tatt kan vises. */
  available: boolean;
  laborExVat: number;
  materialExVat: number;
  subtotalExVat: number;
  vat: number;
  totalIncVat: number;
  /** Avrundet spenn inkl. mva — kun arbeidet får usikkerhetsspenn. */
  range: { low: number; high: number };
  /** True når materialsummen er et gulv fordi noe er upriset. */
  isFloor: boolean;
  materials: MaterialTotal;
};

export type EstimateResult = {
  labor: LaborTotal;
  hourlyRateExVat: number;
  vatRate: number;
  scenarios: Record<MaterialTier, EstimateScenario>;
  /** Kan vi vise materialpriser i det hele tatt for disse postene? */
  materialsAvailable: boolean;
  /** Finnes det et meningsfylt premium-alternativ? */
  premiumAvailable: boolean;
  /** Poster der materialkostnaden bevisst ikke er beregnet. */
  unpricedMaterials: MaterialTotal["unpriced"];
};

function scenario(
  tier: MaterialTier,
  labor: LaborTotal,
  materials: MaterialTotal
): EstimateScenario {
  const laborExVat = labor.totalLaborExVat;
  const materialExVat = tier === "none" ? 0 : materials.totalMaterialExVat;
  const subtotalExVat = round2(laborExVat + materialExVat);
  const vat = round2(subtotalExVat * pricingSettings.vatRate);
  const totalIncVat = round2(subtotalExVat + vat);

  // Usikkerhetsspennet gjelder ARBEIDET. Materialene har allerede sin egen
  // prisbuffer, og skal ikke polstres en gang til.
  const withVat = (exVat: number) => exVat * (1 + pricingSettings.vatRate);
  const lowExVat = laborExVat * pricingSettings.estimateRange.low + materialExVat;
  const highExVat =
    laborExVat * pricingSettings.estimateRange.high + materialExVat;

  return {
    tier,
    label: MATERIAL_TIER_LABELS[tier],
    available: true,
    laborExVat,
    materialExVat,
    subtotalExVat,
    vat,
    totalIncVat,
    range: {
      low: roundForDisplay(withVat(lowExVat)),
      high: roundForDisplay(withVat(highExVat))
    },
    isFloor: tier !== "none" && materials.hasFloorLines,
    materials
  };
}

export function calculateEstimate(lines: EstimateLine[]): EstimateResult {
  const laborInputs: LaborLineInput[] = lines.map((l) => ({
    workItemKey: l.workItemKey,
    label: l.label,
    unit: l.unit,
    quantity: l.quantity,
    difficulty: l.difficulty
  }));

  const labor = calcLaborTotal(laborInputs);

  const materialsFor = (tier: MaterialTier) =>
    calcMaterialTotal(
      lines.map((l) => ({
        workItemKey: l.workItemKey,
        materialRecipeKey: l.materialRecipeKey,
        label: l.label,
        unit: l.unit,
        quantity: l.quantity,
        options: l.options,
        tier
      }))
    );

  const none = materialsFor("none");
  const standard = materialsFor("standard");
  const premium = materialsFor("premium");

  const priceableLines = lines.filter((l) => {
    const key = recipeKeyFor(l);
    const recipe = key ? getRecipe(key) : undefined;
    return (
      recipe != null &&
      recipe.status !== "pending" &&
      recipe.status !== "none"
    );
  });

  const materialsAvailable =
    priceableLines.length > 0 && standard.totalMaterialExVat > 0;

  // Premium tilbys bare når minst én post faktisk HAR et premium-nivå.
  // Vi lager ikke premium-valg der det ikke gir mening.
  const premiumAvailable =
    materialsAvailable &&
    lines.some((l) => {
      const key = recipeKeyFor(l);
      return key ? availableTiers(key).includes("premium") : false;
    }) &&
    premium.totalMaterialExVat !== standard.totalMaterialExVat;

  const scenarios: Record<MaterialTier, EstimateScenario> = {
    none: scenario("none", labor, none),
    standard: {
      ...scenario("standard", labor, standard),
      available: materialsAvailable
    },
    premium: {
      ...scenario("premium", labor, premium),
      available: premiumAvailable
    }
  };

  return {
    labor,
    hourlyRateExVat: pricingSettings.hourlyRateExVat,
    vatRate: pricingSettings.vatRate,
    scenarios,
    materialsAvailable,
    premiumAvailable,
    unpricedMaterials: standard.unpriced
  };
}
