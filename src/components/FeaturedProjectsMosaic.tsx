"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";

export default function FeaturedProjectsMosaic({
  projects
}: {
  projects: Project[];
}) {
  const [revealed, setRevealed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="grid gap-8 md:grid-cols-12">
      {projects.map((p, i) => (
        <Link
          key={p.slug}
          href={`/prosjekter#${p.slug}`}
          data-reveal={revealed ? "in" : "out"}
          style={{
            aspectRatio: i % 3 === 0 ? "4 / 3" : "5 / 4",
            transitionDelay: revealed ? `${i * 80}ms` : "0ms"
          }}
          className={`reveal group relative block overflow-hidden ${
            i % 3 === 0
              ? "md:col-span-7 md:row-span-2"
              : "md:col-span-5"
          }`}
        >
          <div
            className="absolute inset-0 transition-transform duration-[1200ms] ease-swoop group-hover:scale-[1.04]"
            style={{ background: p.gradient }}
            aria-hidden
          />
          <div
            aria-hidden
            className="noise absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
          />
          <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-10">
            <p className="eyebrow text-bone/70">
              {p.category} · {p.year}
            </p>
            <h3 className="headline mt-3 text-3xl md:text-5xl">
              {p.title}
            </h3>
            <p className="mt-2 text-bone/70">{p.place}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
