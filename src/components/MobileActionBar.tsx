"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Persistent bottom action bar on mobile — two-column split between
 * Prisestimat and Kontakt. Hidden on `lg` and above (desktop nav has
 * its own "Be om tilbud" CTA), and on routes where it would fight
 * with the primary in-page CTA (`/kontakt`, `/prisestimat`).
 */
export default function MobileActionBar() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/kontakt") || pathname.startsWith("/prisestimat")) {
    return null;
  }
  return (
    <div
      role="navigation"
      aria-label="Handlingsmeny"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/15 bg-bone/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Single full-width CTA. "Få prisestimat" lives in the header, so
          the bottom bar carries the other half of the conversion pair. */}
      <div className="mx-auto max-w-[var(--page-max)]">
        <Link
          href="/kontakt?type=tilbud"
          className="group flex items-center justify-center gap-3 bg-ink py-4 eyebrow press text-bone"
        >
          Be om tilbud
          <span
            aria-hidden
            className="transition-transform duration-500 ease-swoop group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
