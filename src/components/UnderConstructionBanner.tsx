/**
 * Thin persistent strip at the top of every page — declares the site
 * is a work in progress. Fixed at top-0 with z-50 (above the fixed
 * nav's z-40). Nav is offset to top-8 so it sits directly beneath;
 * the home hero adjusts its negative top margin to swallow both the
 * banner and the nav.
 *
 * Keep the visual language quiet — the banner is honest, not a
 * marketing beat.
 */
export default function UnderConstructionBanner() {
  return (
    <div
      role="status"
      aria-label="Nettsiden er under utvikling"
      className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-center gap-3 border-b border-bone/20 bg-ink px-4 text-bone"
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-bone/80"
      />
      {/* ÉN setning, ikke to varianter bak CSS. To spans lot teksten bli
          lest dobbelt av skjermlesere, søkemotorer og ved kopiering.
          Sporingen strammes inn på små skjermer så linja aldri klippes. */}
      <p className="eyebrow truncate text-[0.55rem] tracking-[0.1em] text-bone/80 sm:text-[0.62rem] sm:tracking-[0.24em] md:text-[0.68rem] md:tracking-[0.32em]">
        Nettsiden er under utvikling — innhold og bilder oppdateres
        fortløpende.
      </p>
    </div>
  );
}
