/**
 * Samlet inngang til prisingskonfigurasjonen.
 *
 *   settings.ts   — timerate, mva, svinn, buffer, spenn  (ÉN kilde til sannhet)
 *   labor.ts      — arbeidstimer per enhet
 *   materials.ts  — norske referansepriser på materialer
 *   recipes.ts    — hvilke materialer som faktisk går med per arbeidspost
 *
 * Eldre kode importerer fortsatt fra "@/config/pricing" — det fungerer,
 * fordi alt re-eksporteres her.
 */

export * from "./settings";
export * from "./labor";
export * from "./materials";
export * from "./recipes";
