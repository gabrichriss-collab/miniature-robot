import "server-only";

import {
  DIFFICULTY_LABELS,
  MATERIAL_TIER_LABELS,
  TERRACE_CONSTRUCTION_LABELS,
  TERRACE_FASTENING_LABELS,
  TERRACE_FOUNDATION_LABELS,
  CEILING_TYPE_LABELS,
  PARTITION_SCOPE_LABELS,
  INSULATION_OPTION_LABELS,
  VAT_PERCENT_DISPLAY,
  type MaterialTier
} from "../../lib/pricing/public";
import type {
  CustomerEstimateLine,
  CustomerEstimateSummary,
  CustomerScenario,
  EstimateRequestLine
} from "../../lib/pricing/contract";
import { calculateEstimate, type EstimateLine } from "./calculateEstimate";
import { calcLaborLine } from "./calculateLabor";
import { calcMaterialLine } from "./calculateMaterials";

/**
 * Oversetter det INTERNE motorresultatet til det kunden får se.
 *
 * Dette er den eneste veien ut av prismotoren. Vi serialiserer aldri
 * interne objekter direkte — hvert felt i svaret er skrevet ut for hånd,
 * slik at et nytt internt felt ikke kan lekke ut ved et uhell.
 *
 * Utelatt med vilje: laborHoursPerUnit, totalLaborHours, timerate,
 * referansepriser, forbruksmengder, svinn, prisbuffer, oppskrifter og
 * vanskelighetsmultiplikatorer.
 */
export function toCustomerEstimate(
  requestLines: EstimateRequestLine[],
  engineLines: Array<EstimateLine & { requestId: string }>,
  tier: MaterialTier
): CustomerEstimateSummary {
  const result = calculateEstimate(engineLines);

  /**
   * Kundevendte beloep avrundes til hele kroner.
   *
   * To grunner: kunden skal ikke se oererester i et estimat, og
   * oerepresisjon er en liten lekkasjekanal — eksakte desimaler gjoer det
   * lettere aa regne seg baklengs til faktorene. Summene bygges opp av de
   * avrundede delene, slik at regnestykket kunden ser gaar opp.
   */
  const kr = (n: number) => Math.round(n);

  const scenario = (t: MaterialTier): CustomerScenario => {
    const s = result.scenarios[t];
    const labor = kr(s.laborExVat);
    const material = kr(s.materialExVat);
    const subtotal = labor + material;
    const vat = kr(subtotal * (VAT_PERCENT_DISPLAY / 100));
    return {
      tier: t,
      label: MATERIAL_TIER_LABELS[t],
      available: s.available,
      laborExVat: labor,
      materialExVat: material,
      subtotalExVat: subtotal,
      vat,
      totalIncVat: subtotal + vat,
      range: { low: s.range.low, high: s.range.high },
      materialEstimateComplete: s.materialEstimateComplete
    };
  };

  const activeTier: MaterialTier = result.scenarios[tier].available ? tier : "none";

  const lines: CustomerEstimateLine[] = engineLines.map((l) => {
    const labor = calcLaborLine({
      workItemKey: l.workItemKey,
      label: l.label,
      unit: l.unit,
      quantity: l.quantity,
      difficulty: l.difficulty,
      options: l.options
    });
    const material = calcMaterialLine({
      workItemKey: l.workItemKey,
      materialRecipeKey: l.materialRecipeKey,
      label: l.label,
      unit: l.unit,
      quantity: l.quantity,
      options: l.options,
      tier: activeTier
    });
    const req = requestLines.find((r) => r.id === l.requestId);

    const chosen: string[] = [];
    if (req?.difficulty && req.difficulty !== "normal") {
      chosen.push(DIFFICULTY_LABELS[req.difficulty]);
    }
    if (req?.terraceConstruction) {
      chosen.push(TERRACE_CONSTRUCTION_LABELS[req.terraceConstruction]);
    }
    if (req?.terraceFastening) {
      chosen.push(TERRACE_FASTENING_LABELS[req.terraceFastening]);
    }
    if (req?.terraceFoundation) {
      chosen.push(TERRACE_FOUNDATION_LABELS[req.terraceFoundation]);
    }
    if (req?.ceilingType) chosen.push(CEILING_TYPE_LABELS[req.ceilingType]);
    if (req?.partitionScope) chosen.push(PARTITION_SCOPE_LABELS[req.partitionScope]);
    if (req?.facadeInsulation) {
      chosen.push(INSULATION_OPTION_LABELS[req.facadeInsulation]);
    }

    return {
      id: l.requestId,
      label: l.label,
      unit: l.unit,
      quantity: labor.quantity,
      laborExVat: kr(labor.laborPriceExVat),
      materialExVat: activeTier === "none" ? 0 : kr(material.materialExVat),
      materialComplete:
        activeTier === "none" ? true : material.pending.length === 0,
      // Bare NAVNET på det som ikke er med — aldri mengden eller prisen.
      notIncluded: material.pending.map((p) => p.label),
      laborPending: labor.laborPending,
      pendingNote: labor.pendingNote,
      chosenOptions: chosen
    };
  });

  return {
    lines,
    scenarios: {
      none: scenario("none"),
      standard: scenario("standard"),
      premium: scenario("premium")
    },
    selectedTier: activeTier,
    materialsAvailable: result.materialsAvailable,
    premiumAvailable: result.premiumAvailable,
    hasPendingLabor: result.hasPendingLabor,
    unpriced: result.unpricedMaterials.map((u) => ({
      label: u.label,
      note: u.note
    })),
    vatPercent: VAT_PERCENT_DISPLAY
  };
}
