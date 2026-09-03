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
      <p className="eyebrow whitespace-nowrap text-[0.62rem] text-bone/80 md:text-[0.68rem]">
        Nettsiden er under utvikling —
        <span className="hidden sm:inline"> innhold og bilder oppdateres fortløpende</span>
        <span className="sm:hidden"> oppdateres fortløpende</span>
      </p>
    </div>
  );
}
