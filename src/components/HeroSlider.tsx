"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = {
  eyebrow: string;
  title: string;
  meta: string;
  gradient: string;
};

const defaultSlides: Slide[] = [
  {
    eyebrow: "Bolig · Alversund",
    title: "Villa Furuli",
    meta: "Nybygg · 340 m² · Massivtre",
    gradient:
      "linear-gradient(120deg, #2a2622 0%, #4a3f34 40%, #7a6a55 100%)"
  },
  {
    eyebrow: "Tilbygg · Meland",
    title: "Hus ved fjorden",
    meta: "Tilbygg · Eik og zink · 2024",
    gradient:
      "linear-gradient(120deg, #1c2320 0%, #3a4a3f 55%, #7a8a75 100%)"
  },
  {
    eyebrow: "Interiør · Sandviken",
    title: "Loftsleilighet",
    meta: "Totalrenovering · Ask og lin",
    gradient:
      "linear-gradient(120deg, #201a15 0%, #5a3d28 50%, #b58a5f 100%)"
  },
  {
    eyebrow: "Kommersiell · Bergen sentrum",
    title: "Kaffebrenneriet",
    meta: "Snekkerarbeid · Furu og messing",
    gradient:
      "linear-gradient(120deg, #16130f 0%, #3a2b1e 50%, #8a6a3f 100%)"
  }
];

export default function HeroSlider({ slides = defaultSlides }: { slides?: Slide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const scrollTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({
        left: clamped * track.clientWidth,
        behavior: "smooth"
      });
      setIndex(clamped);
    },
    [slides.length]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        setIndex(i);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    isDown.current = true;
    startX.current = e.clientX;
    startScroll.current = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDown.current || !trackRef.current) return;
    trackRef.current.scrollLeft = startScroll.current - (e.clientX - startX.current);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDown.current = false;
    const track = trackRef.current;
    if (!track) return;
    track.releasePointerCapture(e.pointerId);
    const i = Math.round(track.scrollLeft / track.clientWidth);
    scrollTo(i);
  };

  return (
    <section className="relative -mt-20 h-[100svh] w-full overflow-hidden bg-ink text-bone">
      <div
        ref={trackRef}
        className="slider-track flex h-full w-full snap-x snap-mandatory overflow-x-auto"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-roledescription="carousel"
        aria-label="Utvalgte prosjekter"
      >
        {slides.map((s, i) => (
          <article
            key={s.title}
            aria-roledescription="slide"
            aria-label={`${i + 1} av ${slides.length}`}
            className="relative h-full w-full flex-none snap-center"
          >
            <div
              className="kenburns absolute inset-0"
              style={{ background: s.gradient }}
              aria-hidden
            />
            <div
              aria-hidden
              className="noise absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/40"
            />
            <div className="relative z-10 mx-auto flex h-full max-w-[var(--page-max)] flex-col justify-end px-6 pb-24 md:px-10 md:pb-32">
              <p className="eyebrow rise rise-1 mb-6 text-bone/70">
                {s.eyebrow}
              </p>
              <h1 className="headline rise rise-2 text-[clamp(3rem,10vw,9rem)]">
                {s.title}
              </h1>
              <p className="rise rise-3 mt-6 max-w-xl text-bone/75">{s.meta}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 mx-auto flex max-w-[var(--page-max)] items-end justify-between px-6 md:px-10">
        <div className="pointer-events-auto flex items-center gap-6 text-bone/80">
          <button
            onClick={() => scrollTo(index - 1)}
            aria-label="Forrige"
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-bone/30 transition-colors hover:bg-bone hover:text-ink"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
          </button>
          <button
            onClick={() => scrollTo(index + 1)}
            aria-label="Neste"
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-bone/30 transition-colors hover:bg-bone hover:text-ink"
          >
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-4 text-bone/70">
          <span className="eyebrow">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-14 bg-bone/40" />
          <span className="eyebrow">
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
