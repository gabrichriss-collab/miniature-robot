# 001 — Add a `.press` utility for universal button press feedback

- **Status**: TODO
- **Commit**: `5fdc192`
- **Severity**: MEDIUM (frequency is Rare per button, but every commit moment on the site is affected)
- **Category**: Purpose & frequency + Physicality & origin (press feedback is a canonical Feedback purpose)
- **Estimated scope**: 5 files, ~7 line-level edits + 1 CSS component class

## Problem

The six primary commit buttons across the site (all bordered, all `eyebrow`-styled, all with an arrow that shifts on hover) confirm intent only via color and border changes on `:hover`. There is no `:active` press feedback. On touch there is no `:hover` — meaning a customer who taps *Beregn prisestimat*, *Ta kontakt*, *Send melding*, or *Last ned prisestimat* gets **no visual confirmation the tap registered** until the next page/route/network response lands. That's the moment where the interface should feel most alive; instead it feels dead.

Locations, verified at commit `5fdc192`:

```tsx
// src/app/page.tsx:36–47  — hero "Beregn prisestimat"
<Link
  href="/prisestimat"
  className="group inline-flex items-center gap-4 border border-bone px-8 py-5 eyebrow text-bone transition-colors hover:bg-bone hover:text-ink"
>
```

```tsx
// src/app/page.tsx:195–205 — footer CTA "Ta kontakt"
<Link
  href="/kontakt"
  className="group inline-flex items-center gap-4 border border-ink px-8 py-5 eyebrow transition-colors hover:bg-ink hover:text-bone"
>
```

```tsx
// src/components/ContactForm.tsx:113–125 — "Send melding" submit
<button
  type="submit"
  disabled={status === "sending"}
  className="group inline-flex items-center gap-4 border border-ink px-8 py-5 eyebrow transition-colors hover:bg-ink hover:text-bone disabled:opacity-60"
>
```

```tsx
// src/components/PrisestimatBuilder.tsx:332–342 — "Last ned prisestimat"
<button
  type="button"
  disabled={!canSubmit || sending}
  onClick={downloadPdf}
  className="group inline-flex items-center gap-4 border border-ink bg-ink px-8 py-5 eyebrow text-bone transition-colors hover:bg-transparent hover:text-ink disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-bone"
>
```

```tsx
// src/components/ServicesSlider.tsx:180–190 — Forrige tjeneste
<button
  type="button"
  onClick={() => goTo(index - 1)}
  aria-label="Forrige tjeneste"
  disabled={index === 0}
  className="group flex h-12 w-12 items-center justify-center rounded-full border border-ink/40 transition-colors hover:bg-ink hover:text-bone disabled:opacity-30"
>
```

```tsx
// src/components/ServicesSlider.tsx:191–201 — Neste tjeneste
<button
  type="button"
  onClick={() => goTo(index + 1)}
  aria-label="Neste tjeneste"
  disabled={index === services.length - 1}
  className="group flex h-12 w-12 items-center justify-center rounded-full border border-ink/40 transition-colors hover:bg-ink hover:text-bone disabled:opacity-30"
>
```

None of these six declare a `:active` state or a transition on `transform`. Adding `active:scale-[0.97]` inline would appear to fix it but silently regresses colour transitions, because Tailwind's `transition-colors` sets `transition-property: color, background-color, border-color, …` — declaring a second `transition-property: transform` on the same element via another utility overwrites the colour list. The right shape is a single `.press` component class that declares both properties in one `transition-property` list.

## Target

A single `.press` component class in `src/app/globals.css` that handles **both** transform and colour transitions in one declaration, so replacing `transition-colors` on each button with `press` keeps the existing hover colour swaps intact while adding the press animation.

```css
/* target — added inside a new @layer components in src/app/globals.css */
@layer components {
  .press {
    transition-property: transform, color, background-color, border-color;
    transition-duration: 140ms, 200ms, 200ms, 200ms;
    transition-timing-function: cubic-bezier(0.7, 0, 0.2, 1);
  }
  .press:active:not(:disabled) {
    transform: scale(0.97);
  }
  @media (prefers-reduced-motion: reduce) {
    .press {
      transition-duration: 90ms, 200ms, 200ms, 200ms;
    }
    .press:active:not(:disabled) {
      transform: scale(0.99);
    }
  }
}
```

Each of the six buttons: **remove `transition-colors`, add `press`**. Every other class stays exactly as-is.

Values are pulled from the audit playbook and this repo's conventions:

- `140ms` sits inside the button-press-feedback budget of 100–160ms (`.agents/skills/improve-animations/AUDIT.md` §2).
- `scale(0.97)` is the exact value called out in AUDIT.md §3 for press feedback ("subtle: 0.95–0.98").
- `cubic-bezier(0.7, 0, 0.2, 1)` is this repo's single canonical curve — same as Tailwind's `ease-swoop` in `tailwind.config.ts:27` and the curve used by `.uline`, `.rise`, `.overlay-enter-active`, and the hamburger bars. AUDIT.md §2 would nominally prefer a strong `ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`), but at 140ms the perceptual difference is minor and the cohesion cost of introducing a second custom curve exceeds the benefit — the site's single-easing convention is deliberate. Do not add a new easing token.
- Reduced-motion softens `scale(0.97)` to `scale(0.99)` and shortens the duration slightly — gentler, not zero (AUDIT.md §6 recommends preserving *some* motion when it's confirming a user's action).
- `:not(:disabled)` prevents the press scale on disabled submit / arrow buttons, matching the existing `disabled:opacity-*` intent.

## Repo conventions to follow

- **Global styles** live in `src/app/globals.css`. Existing classes there follow this pattern — see `.headline` (`globals.css:56–61`) for structure and `.uline` (`globals.css:157–172`) for a class that carries its own transition. Add the new `.press` inside a new `@layer components` block, placed **after** the `.uline` block near the bottom of the file so it sits with other interactive utilities.
- **Tailwind is the primary styling surface.** Do not introduce a new Tailwind plugin, do not add anything to `tailwind.config.ts`, and do not touch the `ease-swoop` token — reuse it via the raw `cubic-bezier` in the CSS class.
- **No motion library** is in use; keep it CSS-only.
- Buttons in this repo use `<button>` when they trigger client-side actions and `<Link>` when they navigate. Both must receive the class. `.press:active:not(:disabled)` works for both — Links have no `disabled` state so the negation is a no-op.

## Steps

1. **Open `src/app/globals.css`.** After the closing `}` of `@keyframes uline-back` (currently line 187), append the following block at the bottom of the file:
   ```css

   /* Universal press feedback: subtle transform + coexists with colour transitions */
   @layer components {
     .press {
       transition-property: transform, color, background-color, border-color;
       transition-duration: 140ms, 200ms, 200ms, 200ms;
       transition-timing-function: cubic-bezier(0.7, 0, 0.2, 1);
     }
     .press:active:not(:disabled) {
       transform: scale(0.97);
     }
     @media (prefers-reduced-motion: reduce) {
       .press {
         transition-duration: 90ms, 200ms, 200ms, 200ms;
       }
       .press:active:not(:disabled) {
         transform: scale(0.99);
       }
     }
   }
   ```

2. **`src/app/page.tsx:38`** — in the *Beregn prisestimat* Link, replace `transition-colors` with `press`. The full className becomes:
   ```
   group inline-flex items-center gap-4 border border-bone px-8 py-5 eyebrow text-bone press hover:bg-bone hover:text-ink
   ```

3. **`src/app/page.tsx:197`** — in the *Ta kontakt* CTA Link, replace `transition-colors` with `press`. Full className:
   ```
   group inline-flex items-center gap-4 border border-ink px-8 py-5 eyebrow press hover:bg-ink hover:text-bone
   ```

4. **`src/components/ContactForm.tsx:116`** — in the *Send melding* submit button, replace `transition-colors` with `press`. Full className:
   ```
   group inline-flex items-center gap-4 border border-ink px-8 py-5 eyebrow press hover:bg-ink hover:text-bone disabled:opacity-60
   ```

5. **`src/components/PrisestimatBuilder.tsx:336`** — in the *Last ned prisestimat* button, replace `transition-colors` with `press`. Full className:
   ```
   group inline-flex items-center gap-4 border border-ink bg-ink px-8 py-5 eyebrow text-bone press hover:bg-transparent hover:text-ink disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-bone
   ```

6. **`src/components/ServicesSlider.tsx:185`** — in the *Forrige tjeneste* arrow button, replace `transition-colors` with `press`. Full className:
   ```
   group flex h-12 w-12 items-center justify-center rounded-full border border-ink/40 press hover:bg-ink hover:text-bone disabled:opacity-30
   ```

7. **`src/components/ServicesSlider.tsx:196`** — in the *Neste tjeneste* arrow button, replace `transition-colors` with `press`. Full className:
   ```
   group flex h-12 w-12 items-center justify-center rounded-full border border-ink/40 press hover:bg-ink hover:text-bone disabled:opacity-30
   ```

## Boundaries

- Do **NOT** touch any other button, link, or interactive element in the codebase. In particular:
  - The plain uline link *Ta kontakt →* at `page.tsx:48–53` is a text link, not a commit button — leave it alone.
  - The button *Se sammendrag →* at `PrisestimatBuilder.tsx:344–349` uses only `uline eyebrow` and is a text-affordance link — leave it alone.
  - The two secondary buttons *Bla i prisliste →* and *+ Ny post* at `PrisestimatBuilder.tsx:237–250` also have `transition-colors`. Out of scope for this plan — they are covered by a follow-up plan if `find-animation-opportunities` calls them out. If tempted, stop.
  - The hamburger toggle at `Nav.tsx:83–101` already has its own `transition-[transform,background-color]` — do not modify.
  - The card / arrow-glyph transitions inside these buttons (the `<span aria-hidden>…→</span>` children) stay untouched.
- Do **NOT** modify `tailwind.config.ts`. Do **NOT** add a new easing token or arbitrary value class.
- Do **NOT** change markup, `type`, `href`, or event handlers on any of the six buttons — CSS class strings only.
- Do **NOT** add `will-change: transform` — the animation is short and cheap; `will-change` on always-mounted buttons wastes a GPU layer.
- If a step's current-code excerpt no longer matches the file (drift since commit `5fdc192`), STOP and report which file drifted rather than guessing where to add `press`.

## Verification

**Mechanical**
- `npx tsc --noEmit` — passes with 0 errors.
- `npx next build` — completes green; the `/`, `/kontakt`, `/prisestimat` routes still show as `○ (Static)` or `ƒ (Dynamic)` per their existing prerender mode. Bundle size for each page changes by <1 KB.

**Feel check** (real browser, run `npm run dev` and open `http://localhost:3000`)
- On desktop, hover each of the six buttons — the existing colour-invert transition still plays, unchanged.
- Click and *hold* the mouse on any button. Confirm the button scales down to 97 % while held and springs back on release. No color regression: the hover colour swap still fires simultaneously.
- On a mobile device (or Chrome DevTools device emulation with touch), tap each button — you should feel the subtle scale-down as the finger lands.
- In Chrome DevTools → Animations panel, throttle playback to 10 % and press a button. Confirm:
  - The transform runs on the compositor thread (no purple layout/paint bars in Performance panel during the animation).
  - Transform and background-color animate together, not sequentially — the button darkens and shrinks in the same visual beat.
- In Chrome DevTools → Rendering → toggle *Emulate CSS media feature `prefers-reduced-motion: reduce`* → click a button. Confirm the scale is barely visible (0.99 vs 0.97) and the transition still runs but shorter. Movement is dampened, not eliminated.
- Click the disabled *Last ned prisestimat* button (before filling in `Navn` + `E-post` on `/prisestimat`) — confirm no scale-down happens; the opacity-40 style is unchanged.
- Click the disabled *Forrige tjeneste* arrow on `/` before dragging the slider — confirm no scale-down.

**Done when**
- All six buttons have `press` instead of `transition-colors` in their className strings.
- `.press` component class exists in `globals.css` at the bottom of the file inside an `@layer components` block.
- The five verification checks above all pass.
- Zero other files modified. `git diff --stat` shows exactly: `src/app/globals.css`, `src/app/page.tsx`, `src/components/ContactForm.tsx`, `src/components/PrisestimatBuilder.tsx`, `src/components/ServicesSlider.tsx` — five files, with a total insertion count in the low 20s.
