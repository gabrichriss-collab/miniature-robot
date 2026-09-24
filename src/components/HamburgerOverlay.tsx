"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const items: Array<{ label: string; href: string }> = [
  { label: "Tjenester", href: "/tjenester" },
  { label: "Prosjekter", href: "/prosjekter" },
  { label: "Prisestimat", href: "/prisestimat" },
  { label: "Om oss", href: "/om-oss" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "Be om tilbud", href: "/kontakt?type=tilbud" }
];

export default function HamburgerOverlay({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={rootRef}
      id="hovedmeny"
      aria-hidden={!open}
      className={`fixed inset-0 z-30 bg-ink text-bone transition-[clip-path] duration-[800ms] ease-menu motion-reduce:duration-0 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        // Sirkelen aapner seg fra menymerket, som staar oppe til HOEYRE.
        //
        // Denne laa fortsatt til venstre. Merket ble flyttet til hoeyre
        // side i headeromleggingen, men origo ble staaende — overlegget
        // aapnet seg altsaa fra motsatt hjoerne av knappen man trykket
        // paa. Rettet her.
        //
        // Vannrett: 24 px sidemarg + 22 px til midten av det 44 px brede
        // merket = 46 px fra hoeyre kant. Loddrett: midten av den 64 px
        // hoeye headeren = 2rem. (Var 4rem mens utviklingsstripen paa 32 px
        // laa over headeren.)
        clipPath: open
          ? "circle(150% at calc(100% - 2.875rem) 2rem)"
          : "circle(0% at calc(100% - 2.875rem) 2rem)"
      }}
    >
      <div className="noise relative mx-auto flex h-full max-w-[var(--page-max)] flex-col justify-between px-6 pb-10 pt-20 md:px-10">
        <nav className="grid gap-1">
          {items.map((it, i) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={onClose}
              className="block py-2"
              style={{
                transitionDelay: open ? `${120 + i * 60}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(1rem)",
                // Samme kurve som flaten og merket, slik at hele
                // sekvensen leses som én bevegelse og ikke tre.
                transition:
                  "opacity 700ms cubic-bezier(0.65,0,0.35,1), transform 800ms cubic-bezier(0.65,0,0.35,1)"
              }}
            >
              <span className="headline text-[clamp(1.75rem,5vw,3.25rem)]">
                {it.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col justify-between gap-8 pt-10 md:flex-row md:items-end">
          <div className="max-w-md">
            <p className="eyebrow mb-3 text-bone/50">Kontakt</p>
            <p className="text-lg text-bone/90">
              kontakt@tomrerkawiche.no
              <br />
              +47 92 12 82 53
            </p>
          </div>
          <div className="max-w-sm text-right">
            <p className="eyebrow mb-3 text-bone/50">Verksted</p>
            <p className="text-lg text-bone/90">
              Uglåsvegen 26
              <br />
              5957 Myking, Norge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
