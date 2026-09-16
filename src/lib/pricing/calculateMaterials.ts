/**
 * MATERIALMOTOREN — helt adskilt fra arbeidsmotoren.
 *
 *   netto forbruk   = mengde × forbruk per enhet
 *   innkjøpsmengde  = netto forbruk × (1 + svinn)
 *   råkost          = innkjøpsmengde × referansepris eks. mva
 *   beskyttet kost  = råkost × (1 + prisbuffer)
 *
 * Svinn og prisbuffer holdes bevisst adskilt. Vi slår dem ALDRI sammen
 * til ett mystisk påslag, slik at begge kan justeres uavhengig.
 *
 * Vanskelighetsfaktoren gjelder kun arbeid — dårlig tilkomst gjør ikke at
 * det går med flere terrassebord.
 */

import { pricingSettings, type MaterialTier } from "../../config/pricing/settings";
import { getMaterial, type Material } from "../../config/pricing/materials";
import {
  getRecipe,
  type MaterialRecipe,
  type PendingMaterialComponent,
  type RecipeStatus
} from "../../config/pricing/recipes";
import { round2, toQty } from "./calculateLabor";

export type MaterialLineComponent = {
  materialId: string;
  name: string;
  unit: string;
  /** Forbruk før svinn. */
  netQuantity: number;
  /** Forbruk etter svinn — dette kjøpes faktisk inn. */
  grossQuantity: number;
  referencePriceExVat: number;
  /** grossQuantity × referansepris. */
  rawCostExVat: number;
  /** Kronebeløpet svinnet utgjør. */
  wasteCostExVat: number;
  /** Kronebeløpet prisbufferen utgjør. */
  protectionCostExVat: number;
  /** rawCost + buffer. Svinnet ligger allerede inne i grossQuantity. */
  totalCostExVat: number;
  assumption?: string;
};

export type MaterialLine = {
  workItemKey: string;
  label: string;
  unit: string;
  quantity: number;
  tier: MaterialTier;
  status: RecipeStatus;
  components: MaterialLineComponent[];
  /** Navngitte poster vi bevisst ikke priser. */
  pending: PendingMaterialComponent[];
  /** Kundevendt forklaring når vi ikke kan prise. */
  customerNote?: string;
  /** Sum svinn i kroner, eks. mva. */
  wasteExVat: number;
  /** Sum prisbuffer i kroner, eks. mva. */
  protectionExVat: number;
  /** Sum materialer eks. mva, inkl. svinn og buffer. */
  materialExVat: number;
  vat: number;
  materialIncVat: number;
  /** True når summen er et gulv fordi noe er upriset. */
  isFloor: boolean;
};

export type MaterialTotal = {
  lines: MaterialLine[];
  totalMaterialExVat: number;
  totalWasteExVat: number;
  totalProtectionExVat: number;
  totalVat: number;
  totalMaterialIncVat: number;
  /** Arbeidsposter uten forsvarlig materialpris. */
  unpriced: Array<{ workItemKey: string; label: string; note: string }>;
  /** True når minst én linje mangler komponenter. */
  hasFloorLines: boolean;
};

export type MaterialLineInput = {
  workItemKey?: string;
  /**
   * Overstyrer hvilken oppskrift som brukes. Settes når posten deler
   * arbeidstimer med en annen post, men har andre materialer
   * (f.eks. terrasse med skjult innfesting eller termofuru).
   */
  materialRecipeKey?: string;
  label: string;
  unit: string;
  quantity: number | string;
  tier: MaterialTier;
};

/** Hvilken oppskriftsnøkkel en linje faktisk skal slå opp. */
export function recipeKeyFor(input: {
  workItemKey?: string;
  materialRecipeKey?: string;
}): string | undefined {
  return input.materialRecipeKey ?? input.workItemKey;
}

/** Komponentene som gjelder for valgt materialnivå. */
function componentsForTier(recipe: MaterialRecipe, tier: MaterialTier) {
  if (tier === "none") return [];
  const tiered = recipe.tiers?.[tier];
  // Finnes ikke premium for denne posten, faller vi tilbake på standard
  // i stedet for å finne opp et premium-alternativ som ikke gir mening.
  const resolved = tiered ?? recipe.tiers?.standard ?? [];
  return [...recipe.components, ...resolved];
}

function priceComponent(
  material: Material,
  quantity: number,
  netPerUnit: number,
  assumption?: string
): MaterialLineComponent {
  const netQuantity = round2(quantity * netPerUnit);
  const grossQuantity = round2(netQuantity * (1 + material.wasteFactor));

  const netCost = round2(netQuantity * material.referencePriceExVat);
  const rawCostExVat = round2(grossQuantity * material.referencePriceExVat);
  const wasteCostExVat = round2(rawCostExVat - netCost);
  const protectionCostExVat = round2(rawCostExVat * material.protectionFactor);
  const totalCostExVat = round2(rawCostExVat + protectionCostExVat);

  return {
    materialId: material.id,
    name: material.name,
    unit: material.unit,
    netQuantity,
    grossQuantity,
    referencePriceExVat: round2(material.referencePriceExVat),
    rawCostExVat,
    wasteCostExVat,
    protectionCostExVat,
    totalCostExVat,
    assumption
  };
}

/** Regn ut materialkostnaden for én arbeidspost. */
export function calcMaterialLine(input: MaterialLineInput): MaterialLine {
  const quantity = toQty(input.quantity);
  const key = recipeKeyFor(input);
  const recipe = key ? getRecipe(key) : undefined;

  const empty = (status: RecipeStatus, note?: string): MaterialLine => ({
    workItemKey: input.workItemKey ?? "",
    label: input.label,
    unit: input.unit,
    quantity,
    tier: input.tier,
    status,
    components: [],
    pending: recipe?.pending ?? [],
    customerNote: note,
    wasteExVat: 0,
    protectionExVat: 0,
    materialExVat: 0,
    vat: 0,
    materialIncVat: 0,
    isFloor: false
  });

  if (input.tier === "none") return empty("none");
  if (!recipe) {
    return empty(
      "pending",
      "Materialkostnad for denne posten er ikke kartlagt ennå og avklares ved befaring."
    );
  }
  if (recipe.status === "none" || recipe.status === "pending") {
    return empty(recipe.status, recipe.customerNote);
  }

  const components = componentsForTier(recipe, input.tier)
    .map((c) => {
      const material = getMaterial(c.materialId);
      if (!material) return null;
      return priceComponent(material, quantity, c.quantityPerUnit, c.assumption);
    })
    .filter((c): c is MaterialLineComponent => c !== null);

  const wasteExVat = round2(
    components.reduce((s, c) => s + c.wasteCostExVat, 0)
  );
  const protectionExVat = round2(
    components.reduce((s, c) => s + c.protectionCostExVat, 0)
  );
  const materialExVat = round2(
    components.reduce((s, c) => s + c.totalCostExVat, 0)
  );
  const vat = round2(materialExVat * pricingSettings.vatRate);

  return {
    workItemKey: recipe.id,
    label: input.label,
    unit: input.unit,
    quantity,
    tier: input.tier,
    status: recipe.status,
    components,
    pending: recipe.pending ?? [],
    customerNote: recipe.customerNote,
    wasteExVat,
    protectionExVat,
    materialExVat,
    vat,
    materialIncVat: round2(materialExVat + vat),
    isFloor: recipe.status === "partial"
  };
}

export function calcMaterialTotal(inputs: MaterialLineInput[]): MaterialTotal {
  const lines = inputs.map(calcMaterialLine);

  const totalMaterialExVat = round2(
    lines.reduce((s, l) => s + l.materialExVat, 0)
  );
  const totalWasteExVat = round2(lines.reduce((s, l) => s + l.wasteExVat, 0));
  const totalProtectionExVat = round2(
    lines.reduce((s, l) => s + l.protectionExVat, 0)
  );
  const totalVat = round2(lines.reduce((s, l) => s + l.vat, 0));

  const unpriced = lines
    .filter((l) => l.status === "pending" && l.quantity > 0)
    .map((l) => ({
      workItemKey: l.workItemKey,
      label: l.label,
      note:
        l.customerNote ??
        "Materialkostnad avklares ved gjennomgang eller befaring."
    }));

  return {
    lines,
    totalMaterialExVat,
    totalWasteExVat,
    totalProtectionExVat,
    totalVat,
    totalMaterialIncVat: round2(totalMaterialExVat + totalVat),
    unpriced,
    hasFloorLines: lines.some((l) => l.isFloor && l.quantity > 0)
  };
}
