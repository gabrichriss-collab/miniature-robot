"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { services } from "@/data/services";

/**
 * Multiform.dk-inspired horizontal slider for the home Tjenester section.
 * - Cards ~80vw on mobile / ~40vw on desktop → peek of next card visible
 * - Pointer-drag with snap
 * - Side arrows below the track
 * - Index counter "01 — 06"
 */
export default function ServicesSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const isDown = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const dragMoved = useRef(false);

  /** Width of one card + gap in pixels — measured from the DOM so we stay honest with CSS. */
  const stepPx = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const first = track.querySelector<HTMLElement>("[data-slide]");
    if (!first) return track.clientWidth;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    return first.offsetWidth + gap;
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(services.length - 1, i));
      track.scrollTo({ left: clamped * stepPx(), behavior: "smooth" });
      setIndex(clamped);
    },
    [stepPx]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = stepPx();
        if (step > 0) setIndex(Math.round(track.scrollLeft / step));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [stepPx]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    isDown.current = true;
    dragMoved.current = false;
    startX.current = e.clientX;
    startScroll.current = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDown.current || !trackRef.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 4) dragMoved.current = true;
    trackRef.current.scrollLeft = startScroll.current - dx;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDown.current = false;
    const track = trackRef.current;
    if (!track) return;
    track.releasePointerCapture(e.pointerId);
    const step = stepPx();
    if (step > 0) {
      const i = Math.round(track.scrollLeft / step);
      goTo(i);
    }
  };

  /** Prevent the drag gesture from triggering the card's <Link> navigation. */
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section
      aria-label="Tjenester"
      className="relative py-28 md:py-40"
    >
      {/* Header — kept inside the max-width container */}
      <div className="mx-auto mb-14 flex max-w-[var(--page-max)] items-end justify-between px-6 md:mb-20 md:px-10">
        <p className="eyebrow">02 — Tjenester</p>
        <Link href="/tjenester" className="uline eyebrow">
          Alle tjenester →
        </Link>
      </div>

      {/*
        The track goes edge-to-edge (breaks out of the page container) so the
        peek of the next card sits at the right edge like on multiform.dk.
        Left padding aligns the first card with the page grid gutter.
      */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        role="region"
        aria-roledescription="carousel"
        className="slider-track flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-pl-6 pl-6 md:gap-8 md:scroll-pl-10 md:pl-10"
      >
        {services.map((s, i) => (
          <Link
            key={s.slug}
            href={`/tjenester#${s.slug}`}
            data-slide
            aria-roledescription="slide"
            aria-label={`${i + 1} av ${services.length}`}
            className="group relative flex-none snap-start overflow-hidden text-bone"
            style={{
              // 82vw mobile, ~40vw desktop, cap width so it looks right on large screens
              width: "min(82vw, 28rem)",
              aspectRatio: "3 / 4"
            }}
          >
            <div
              className="absolute inset-0 transition-transform duration-[1400ms] ease-swoop group-hover:scale-[1.05]"
              style={{ background: s.gradient }}
              aria-hidden
            />
            <div
              aria-hidden
              className="noise absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
            />

            <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
              <div className="flex items-start justify-between">
                <span className="eyebrow text-bone/70">{s.kicker}</span>
                <span className="eyebrow text-bone/50">
                  {String(i + 1).padStart(2, "0")}/
                  {String(services.length).padStart(2, "0")}
                </span>
              </div>

              <div>
                <h3 className="headline text-[clamp(1.75rem,4.2vw,2.75rem)] leading-[0.98]">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-xs text-sm text-bone/80">{s.lede}</p>
                <span className="uline mt-6 inline-block eyebrow text-bone">
                  Utforsk →
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Right-side spacer so the last card can snap-start without being flush to the edge. */}
        <div aria-hidden className="flex-none w-6 md:w-10" />
      </div>

      {/* Controls */}
      <div className="mx-auto mt-10 flex max-w-[var(--page-max)] items-center justify-between px-6 md:mt-14 md:px-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Forrige tjeneste"
            disabled={index === 0}
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-ink/40 press hover:bg-ink hover:text-bone disabled:opacity-30"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Neste tjeneste"
            disabled={index === services.length - 1}
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-ink/40 press hover:bg-ink hover:text-bone disabled:opacity-30"
          >
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-ink/60">
          <span className="eyebrow">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-14 bg-ink/30" />
          <span className="eyebrow">
            {String(services.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
