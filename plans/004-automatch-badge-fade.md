# 004 — Auto-match badge fade-in on fuzzy-match hit

- **Status**: DONE
- **Commit**: `493f929`
- **Severity**: LOW (polish, but a real feedback moment)
- **Category**: Purpose & frequency (feedback confirming a system action)
- **Estimated scope**: 2 files, ~10 lines total (1 CSS block + 1 className swap)

## Problem

When a customer types into a prisestimat row's description field (e.g. "terrasse 36"), the fuzzy matcher fills in `unit`, `price`, `note`, and marks the row as matched. A small **Auto** badge then appears below the input showing what got auto-filled — but it teleports in with no visual bridge.

Verified at commit `493f929`:

```tsx
// src/components/PrisestimatBuilder.tsx:419–425 — badge conditional render
{row.matched && row.matchName ? (
  <p className="mt-2 text-xs text-ink/60">
    <span className="eyebrow mr-2 text-ink/80">Auto</span>
    {row.matchName}
    {row.note ? ` · ${row.note}` : ""}
  </p>
) : null}
```

The badge only renders once per row (once `matched` flips true, it stays true). Frequency per session: rare — fires at most once per row typed, so the AUDIT §1 gate is comfortably in the *Rare* tier. This is exactly where the delight budget lives; the badge is confirming that the system just did something helpful for the customer.

## Target

Wrap the conditional with a `.match-badge` class that runs a soft fade-and-lift via `@starting-style`. Because the badge doesn't disappear, no exit animation is needed.

```css
/* target — appended at top-level in src/app/globals.css, near the other @starting-style rules */
.match-badge {
  transition-property: transform, opacity;
  transition-duration: 220ms;
  transition-timing-function: cubic-bezier(0.7, 0, 0.2, 1);
}
@starting-style {
  .match-badge {
    opacity: 0;
    transform: translateY(-3px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .match-badge {
    transition-duration: 160ms;
  }
  @starting-style {
    .match-badge {
      transform: none;
    }
  }
}
```

```tsx
// target — PrisestimatBuilder.tsx:419–425 with `match-badge` prepended to className
{row.matched && row.matchName ? (
  <p className="match-badge mt-2 text-xs text-ink/60">
    <span className="eyebrow mr-2 text-ink/80">Auto</span>
    {row.matchName}
    {row.note ? ` · ${row.note}` : ""}
  </p>
) : null}
```

Values from AUDIT.md:
- 220 ms fits between tooltip (125–200 ms) and dropdown (150–250 ms) — appropriate for a small in-page confirmation (§2).
- `translateY(-3px)` — a whisper of movement, well below the "never scale(0)" line (§3).
- Curve reuses the repo's canonical `cubic-bezier(0.7, 0, 0.2, 1)`.

## Repo conventions to follow

- **Global styles** in `src/app/globals.css`. `@starting-style` rules live at top level — see how plan 002 / plan 003 place them.
- **Utility naming**: `.match-badge` is descriptive, kebab-case, in the same style as `.row-enter`.
- **No new tokens** — `cubic-bezier(0.7, 0, 0.2, 1)` inlined.

## Steps

1. **Open `src/app/globals.css`.** In the top-level section (after the `@keyframes` blocks and any `@layer components`, near the other `@starting-style` rules from plans 002 and 003 — or if executing this plan alone, near the bottom of the file), append:
   ```css
   .match-badge {
     transition-property: transform, opacity;
     transition-duration: 220ms;
     transition-timing-function: cubic-bezier(0.7, 0, 0.2, 1);
   }
   @starting-style {
     .match-badge {
       opacity: 0;
       transform: translateY(-3px);
     }
   }
   @media (prefers-reduced-motion: reduce) {
     .match-badge {
       transition-duration: 160ms;
     }
     @starting-style {
       .match-badge {
         transform: none;
       }
     }
   }
   ```

2. **`src/components/PrisestimatBuilder.tsx:419–425`** — prepend `match-badge ` to the `<p>` element's className. Full className:
   ```
   match-badge mt-2 text-xs text-ink/60
   ```

## Boundaries

- Do **NOT** touch the RowItem `<div>` root, the description `<input>`, the auto-match logic in `updateRow` (`PrisestimatBuilder.tsx:73–99`), or the badge's inner `<span>` styling.
- Do **NOT** add an exit animation. The badge sticks once shown; that's correct behaviour.
- Do **NOT** animate the "Auto" text glyph itself (the `<span className="eyebrow">`); it's part of the badge's static composition.
- Do **NOT** put this in `@layer components` — keep `@starting-style` at top level.
- If the badge markup at `PrisestimatBuilder.tsx:419–425` has drifted since commit `493f929`, STOP and report.

## Verification

**Mechanical**
- `npx tsc --noEmit` — passes.
- `npx next build` — passes; no bundle size change (CSS only).

**Feel check** (`npm run dev` then `http://localhost:3000/prisestimat`)
- Click **+ Ny post**. In the empty row, type `terrasse` in the description. The fuzzy matcher fires — the row's unit/price populate AND the "Auto" badge line fades in from `translateY(-3px)` over 220 ms.
- Delete the input value (backspace) so `row.matched` flips false — badge disappears instantly. Type again — badge reappears with the same animation. `@starting-style` re-fires because the element was unmounted and remounted.
- Repeat on multiple rows — each independent badge fires on its own row.
- DevTools → Animations panel, throttle to 10 %, trigger a match. Confirm the badge lifts from -3 px and fades in during the 220 ms window with the swoop curve.
- DevTools → Rendering → **prefers-reduced-motion: reduce** → trigger a match. Confirm the translate is gone but the fade still runs over 160 ms.

**Done when**
- `.match-badge` block exists in `globals.css` with the exact values above (including `@starting-style` and reduced-motion variants).
- The badge `<p>` has `match-badge` prepended to its className.
- `git diff --stat` shows exactly two files: `src/app/globals.css` (+16 lines), `src/components/PrisestimatBuilder.tsx` (+1 word in className).
- Feel-check bullets all pass.
