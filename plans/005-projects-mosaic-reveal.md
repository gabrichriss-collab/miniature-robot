# 005 — Projects mosaic scroll-in stagger

- **Status**: DONE
- **Commit**: `493f929`
- **Severity**: LOW (polish; a single scroll-triggered moment that adds weight to the below-fold content)
- **Category**: Missed opportunity (group entrance) + Interruptibility
- **Estimated scope**: 3 files — 1 new client component (~50 lines), 1 CSS block (~20 lines), 1 page.tsx swap (~5 lines)

## Problem

The home page's "Utvalgte prosjekter" mosaic renders all four featured project cards visible from the moment the page mounts. When the user scrolls down past the ServicesSlider and the mosaic enters the viewport, the whole block just *is there* — fully composed, no arrival beat.

The projects mosaic is a rare moment on the home page: users see it once per visit. Per AUDIT.md §1 that puts it in the *Occasional* tier where "standard animation" is welcome, and per the `find-animation-opportunities` "Group entrances" hunt list this is a textbook case for a subtle stagger-in.

Verified at commit `493f929`:

```tsx
// src/app/page.tsx:103–135 — the mosaic
<div className="grid gap-8 md:grid-cols-12">
  {featured.map((p, i) => (
    <Link
      key={p.slug}
      href={`/prosjekter#${p.slug}`}
      className={`group relative block overflow-hidden ${
        i % 3 === 0
          ? "md:col-span-7 md:row-span-2"
          : "md:col-span-5"
      }`}
      style={{ aspectRatio: i % 3 === 0 ? "4 / 3" : "5 / 4" }}
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
```

`page.tsx` is a server component; the mosaic loop lives inline. IntersectionObserver requires client-side execution, so this plan extracts the mosaic into its own client component.

## Target

New client component `src/components/FeaturedProjectsMosaic.tsx` that owns an `IntersectionObserver`, flips a `data-reveal` attribute on its child cards when 15 % of the section enters the viewport, and applies staggered transition delays (0 ms, 80 ms, 160 ms, 240 ms) so the cards cascade in over ~940 ms end-to-end.

```tsx
// target — src/components/FeaturedProjectsMosaic.tsx
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
```

And the CSS that drives the reveal:

```css
/* target — appended at top level in src/app/globals.css */
.reveal {
  transition-property: transform, opacity;
  transition-duration: 700ms;
  transition-timing-function: cubic-bezier(0.7, 0, 0.2, 1);
}
.reveal[data-reveal="out"] {
  opacity: 0;
  transform: translateY(24px);
}
.reveal[data-reveal="in"] {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .reveal {
    transition-property: opacity;
    transition-duration: 400ms;
  }
  .reveal[data-reveal="out"] {
    transform: none;
  }
}
```

Values from AUDIT.md:
- 700 ms per card + 80 ms stagger between cards is in the "marketing / explanatory" range (§2), acceptable for a one-time occasional entrance.
- `translateY(24px)` is subtle enough for restraint — a modest lift, not a slam. Never `scale(0)`.
- Stagger of 80 ms matches the `find-animation-opportunities` recommendation of 30–80 ms.
- Curve reuses the repo's `cubic-bezier(0.7, 0, 0.2, 1)`.
- Reduced-motion drops the translate — pure opacity fade over 400 ms.

## Repo conventions to follow

- **Client components** live under `src/components/`. See `HeroSlider.tsx`, `ServicesSlider.tsx`, `PrisestimatBuilder.tsx` for the pattern: `"use client"` at the top, hooks and event handlers below.
- **Type imports** from `src/data/*` — see how `pricing.ts` types are consumed in `PrisestimatBuilder.tsx` for the pattern.
- **Global styles** for reveal in `globals.css` at top level, not inside a Tailwind `@layer`. Matches how plans 002/003/004 placed their `@starting-style` and attribute-selector rules.
- **No motion library** — plain CSS transitions.

## Steps

1. **Create `src/components/FeaturedProjectsMosaic.tsx`** with the full contents from the Target section (first code block above).

2. **Open `src/app/globals.css`** and append the reveal CSS block from the Target section (second code block) at top-level scope, after any existing top-level rules (e.g. modal `[data-modal-*]` rules from plan 003, or if plan 003 hasn't been executed, after the `@keyframes` blocks).

3. **`src/app/page.tsx`** — replace the inline mosaic markup at lines 103–135 with a single `<FeaturedProjectsMosaic projects={featured} />` call. Two sub-edits:

   3a. At the top of `src/app/page.tsx`, add the import next to the existing `ServicesSlider` import (line 2):
   ```tsx
   import FeaturedProjectsMosaic from "@/components/FeaturedProjectsMosaic";
   ```

   3b. Replace the entire `<div className="grid gap-8 md:grid-cols-12">…</div>` block (lines 103–135) with:
   ```tsx
   <FeaturedProjectsMosaic projects={featured} />
   ```

## Boundaries

- Do **NOT** modify the mosaic's visual composition — background gradients, noise texture, layout classes, aspect ratios, colspan pattern all move verbatim from `page.tsx` into `FeaturedProjectsMosaic.tsx`. Only the wrapping div structure and the reveal wiring differ.
- Do **NOT** reveal any other section (numbers, trust markers, CTA). This plan is the projects mosaic only.
- Do **NOT** use `.rise` — that class runs on mount, not on scroll into view. This is different.
- Do **NOT** animate `filter`, `background`, `height`, or any non-transform/opacity property.
- Do **NOT** create a generic `<ScrollReveal>` wrapper here. If future plans want that abstraction, they can extract it — for now, one-off in the mosaic component is clearer.
- Do **NOT** run the observer permanently — call `observer.disconnect()` after the first intersecting entry. Reveal is a one-way transition; a permanent observer wastes cycles.
- Do **NOT** move `page.tsx` from server component to client component. Only the mosaic child becomes a client component; `page.tsx` stays server.
- If the mosaic markup at `page.tsx:103–135` has drifted since commit `493f929`, STOP and report.

## Verification

**Mechanical**
- `npx tsc --noEmit` — passes. Ensure `Project` type is imported from `@/data/projects`.
- `npx next build` — passes; `/` bundle should grow by ~1–2 KB (the new client component ships client-side JS).
- The build log should still list `/` as `○ (Static)` — page.tsx remains a server component; only the mosaic hydrates.

**Feel check** (`npm run dev` then `http://localhost:3000/`)
- Load the page in an incognito window. **Do not scroll yet.** The mosaic is below the fold; its cards should be in the `data-reveal="out"` state (invisible, translated down 24 px).
- Scroll slowly down past the ServicesSlider until "Utvalgte prosjekter" enters view. As the section crosses ~15 % of the viewport threshold, all four cards begin their reveal — card 1 first (0 ms delay), card 2 at 80 ms, card 3 at 160 ms, card 4 at 240 ms. The last one settles ~940 ms after the first started. It should feel like a slow tide, not a wave.
- Scroll away and back — the reveal does NOT re-play. Cards stay revealed once entered (the observer disconnected).
- Reload the page and scroll down fast (drag the scrollbar to the bottom). The cards should already be revealing / revealed by the time they land in view — no dead cards visible below the fold.
- Chrome DevTools → Animations panel, throttle playback to 10 %, reload and scroll to the section. Watch the four cards cascade with 80 ms offsets.
- DevTools → Rendering → **prefers-reduced-motion: reduce** → reload. Confirm the translate is gone but the opacity still fades over 400 ms per card (stagger still applies).
- Test on `http://localhost:3000/prosjekter` — that page is unaffected (it uses its own mosaic). The Featured mosaic component is only imported from `/`.

**Done when**
- `src/components/FeaturedProjectsMosaic.tsx` exists as a `"use client"` component with the exact contents in the Target section.
- `src/app/globals.css` carries the `.reveal` + `[data-reveal]` rules and reduced-motion variant.
- `src/app/page.tsx` no longer contains the inline mosaic markup — a single `<FeaturedProjectsMosaic projects={featured} />` call in its place. The `import` is added.
- `git diff --stat` shows exactly three files: `src/app/globals.css`, `src/app/page.tsx`, `src/components/FeaturedProjectsMosaic.tsx` (new).
- All feel-check bullets pass.
