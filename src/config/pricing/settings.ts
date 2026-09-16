/**
 * GLOBALE FORRETNINGSINNSTILLINGER — én kilde til sannhet.
 *
 * Endrer du `hourlyRateExVat` her (850 → 950), oppdateres ALLE
 * arbeidspriser i hele Prisestimat automatisk. Ingen avledet kr/m²-pris
 * skal hardkodes noe annet sted i kodebasen.
 */

export const pricingSettings = {
  /** Timerate eks. mva. Eneste sted denne finnes. */
  hourlyRateExVat: 850,

  /** Norsk merverdiavgift. */
  vatRate: 0.25,

  /**
   * Standard materialsvinn — andel, ikke multiplikator.
   * 0.10 betyr at det kjøpes inn 10 % mer enn netto forbruk.
   * Kan overstyres per material.
   */
  defaultMaterialWaste: 0.1,

  /**
   * Materialpris-buffer — andel, ikke multiplikator.
   * Beskytter estimatet mot prisforskjeller mellom forhandlere, lokal
   * tilgjengelighet, mindre prisøkninger, kjøp utenom kampanje og
   * småforbruksvarer. Dette er IKKE fortjenestepåslag.
   * Kan overstyres per material.
   */
  defaultMaterialProtection: 0.1,

  /**
   * Usikkerhetsspenn rundt ARBEIDSestimatet. Materialer får sin egen
   * buffer via protectionFactor og skal ikke polstres to ganger.
   */
  estimateRange: {
    low: 0.9,
    high: 1.15
  },

  /** Kundevendte summer avrundes til nærmeste hele beløp. */
  displayRoundingNok: 500
} as const;

/** Bakoverkompatible aliaser — brukt av eldre importer. */
export const HOURLY_RATE_EX_VAT = pricingSettings.hourlyRateExVat;
export const VAT_RATE = pricingSettings.vatRate;

/**
 * Vanskelighetsfaktorer. Gjelder KUN arbeidstimer. Dårlig tilkomst gjør
 * ikke at det går med mer materialer, så materialmengder røres ikke.
 */
export const DIFFICULTY_FACTORS = {
  normal: 1.0,
  difficult: 1.15,
  veryDifficult: 1.3
} as const;

export type DifficultyKey = keyof typeof DIFFICULTY_FACTORS;
export type DifficultyLevel = DifficultyKey;

export const DIFFICULTY_LABELS: Record<DifficultyKey, string> = {
  normal: "Normal tilkomst",
  difficult: "Krevende tilkomst",
  veryDifficult: "Svært krevende tilkomst"
};

/** Hvilket materialnivå kunden har valgt. */
export type MaterialTier = "none" | "standard" | "premium";

export const MATERIAL_TIER_LABELS: Record<MaterialTier, string> = {
  none: "Kun arbeid",
  standard: "Standard materialer",
  premium: "Premium materialer"
};

/** Juridisk tekst — brukes i UI, PDF og e-post slik at ordlyden er lik. */
export const ESTIMATE_DISCLAIMER =
  "Dette er et veiledende prisestimat basert på opplysningene du har lagt " +
  "inn, standard beregnet arbeidstid og veiledende materialpriser. Faktisk " +
  "pris kan variere på grunn av eksisterende konstruksjon, tilkomst, " +
  "materialvalg, leverandørpriser og forhold som først kan vurderes ved " +
  "gjennomgang eller befaring.";

export const ESTIMATE_DISCLAIMER_CLOSING =
  "Endelig pris fastsettes i et skriftlig tilbud.";
