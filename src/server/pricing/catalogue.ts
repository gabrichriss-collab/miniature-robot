import "server-only";

import { PRICE_DB } from "./catalogue-source";
import { WORK_ITEMS, laborHoursForItem } from "./labor";
import { availableTiers, getRecipe } from "./recipes";
import type { CatalogueItem } from "../../lib/pricing/public";

/**
 * Bygger den OFFENTLIGE katalogen nettleseren får se.
 *
 * Her siles alt kommersielt bort: `price` (gamle kr/enhet),
 * `laborHoursPerUnit`, oppskrifter og materialpriser blir aldri med.
 * Igjen står navn, enhet, kategori, søkeord og to boolske flagg — nok
 * til å tegne grensesnittet og gjøre fritekstsøk, og ikke noe mer.
 */
export function buildPublicCatalogue(): CatalogueItem[] {
  return PRICE_DB.map((e) => {
    const key = e.workItemKey;
    const recipe = key ? getRecipe(key) : undefined;
    return {
      id: e.name,
      name: e.name,
      unit: e.unit,
      category: e.cat,
      note: e.note,
      keywords: e.keywords,
      priceable: key != null && laborHoursForItem(key) != null,
      hasPremium:
        key != null &&
        recipe != null &&
        availableTiers(key).includes("premium"),
      optionGroups: optionGroupsFor(key)
    };
  });
}

/** Slår en offentlig katalog-ID tilbake til den interne prisposten. */
export function resolveCatalogueId(id: string) {
  return PRICE_DB.find((e) => e.name === id);
}

/** Hvilke valggrupper posten faktisk bruker — styrer hvilke felt UI viser. */
export function optionGroupsFor(workItemKey: string | undefined): string[] {
  if (!workItemKey) return [];
  const groups: string[] = [];
  if (laborHoursForItem(workItemKey) != null) groups.push("difficulty");
  if (workItemKey === "terraceComplete" || workItemKey === "terraceDeckingOnly") {
    groups.push("terrace");
  }
  if (workItemKey === "ceilingWork") groups.push("ceiling");
  if (workItemKey === "interiorPartitionWall") groups.push("partition");
  if (workItemKey === "facadeComplete" || workItemKey === "exteriorInsulation") {
    groups.push("insulation");
  }
  return groups;
}

/** Alle gyldige arbeidsnøkler — brukes av validering. */
export const VALID_WORK_ITEM_KEYS = new Set(Object.keys(WORK_ITEMS));
