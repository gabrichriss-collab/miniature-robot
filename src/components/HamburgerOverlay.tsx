"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const items: Array<{ label: string; href: string; kicker: string }> = [
  { label: "Tjenester", href: "/tjenester", kicker: "01" },
  { label: "Prosjekter", href: "/prosjekter", kicker: "02" },
  { label: "Prisestimat", href: "/prisestimat", kicker: "03" },
  { label: "Om oss", href: "/om-oss", kicker: "04" },
  { label: "Bærekraft", href: "/baerekraft", kicker: "05" },
  { label: "Karriere", href: "/karriere", kicker: "06" },
  { label: "Kontakt", href: "/kontakt", kicker: "07" }
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
      aria-hidden={!open}
      className={`fixed inset-0 z-30 bg-ink text-bone transition-[clip-path] duration-700 ease-swoop ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        clipPath: open
          ? "circle(150% at calc(100% - 2.75rem) 2.75rem)"
          : "circle(0% at calc(100% - 2.75rem) 2.75rem)"
      }}
    >
      <div className="noise relative mx-auto flex h-full max-w-[var(--page-max)] flex-col justify-between px-6 pb-10 pt-28 md:px-10">
        <nav className="grid gap-2 md:gap-3">
          {items.map((it, i) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={onClose}
              className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-6 border-b border-bone/15 py-4 md:py-6"
              style={{
                transitionDelay: open ? `${120 + i * 60}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(1rem)",
                transition:
                  "opacity 600ms cubic-bezier(0.7,0,0.2,1), transform 700ms cubic-bezier(0.7,0,0.2,1)"
              }}
            >
              <span className="eyebrow text-bone/50">{it.kicker}</span>
              <span className="headline text-[clamp(2.25rem,7vw,5.5rem)]">
                {it.label}
              </span>
              <span
                aria-hidden
                className="translate-x-0 text-bone/40 transition-transform duration-500 ease-swoop group-hover:translate-x-2"
              >
                →
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
