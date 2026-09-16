/**
 * Bakoverkompatibel inngang. Arbeidsmotoren bor nå i
 * `src/lib/pricing/calculateLabor.ts` ved siden av materialmotoren.
 */

export {
  toQty,
  round2,
  calcLaborLine,
  calcLaborTotal,
  type LaborLine,
  type LaborLineInput,
  type LaborTotal
} from "@/lib/pricing/calculateLabor";

export { formatNok, formatHours, formatQty, roundForDisplay } from "@/lib/pricing/format";

export { laborHoursForItem } from "@/config/pricing/labor";
