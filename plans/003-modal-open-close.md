# 003 — Modal open/close for BrowseModal + SummaryModal

- **Status**: DONE
- **Commit**: `493f929`
- **Severity**: MEDIUM
- **Category**: Physicality & origin (missing spatial story) + Interruptibility
- **Estimated scope**: 2 files, ~40 lines net (ModalShell refactor + CSS block)

## Problem

Both modals in the prisestimat builder — **BrowseModal** and **SummaryModal** — snap into being when opened and snap out when closed. Backdrop teleports to full opacity; panel teleports to full size. This is the canonical modal open/close teleport that AUDIT.md §3 calls out.

The shared shell that renders both:

```tsx
// src/components/PrisestimatBuilder.tsx:522–555 — ModalShell
function ModalShell({
  onClose,
  title,
  children
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-auto bg-bone shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-bone px-6 py-5 md:px-10">
          <p className="eyebrow">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="text-2xl text-ink/50 hover:text-ink"
          >
            ×
          </button>
        </header>
        <div className="px-6 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}
```

Both modals unmount immediately when `onClose` fires (React re-renders the parent with `showBrowse === false`, discarding the modal element). For a proper exit animation, DOM must persist for the transition's duration before unmount.

## Target

Refactor `ModalShell` to hold an internal `state: "open" | "closed"` — flip to `"closed"` when the user requests dismissal, wait 240 ms for the exit transition to play, then call the caller's `onClose`. Emit `data-modal-backdrop` and `data-modal-panel` attributes so a small CSS block styles both entry and exit symmetrically.

```tsx
// target — new ModalShell body
function ModalShell({
  onClose,
  title,
  children
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<"open" | "closed">("open");

  const requestClose = useCallback(() => {
    setState("closed");
    window.setTimeout(onClose, 240);
  }, [onClose]);

  return (
    <div
      data-modal-backdrop
      data-state={state}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      onClick={requestClose}
    >
      <div
        data-modal-panel
        data-state={state}
        className="max-h-[85vh] w-full max-w-3xl overflow-auto bg-bone shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-bone px-6 py-5 md:px-10">
          <p className="eyebrow">{title}</p>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Lukk"
            className="text-2xl text-ink/50 hover:text-ink"
          >
            ×
          </button>
        </header>
        <div className="px-6 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}
```

And the CSS that animates the states:

```css
/* target — added at top level in src/app/globals.css, after the existing keyframes */

[data-modal-backdrop] {
  transition: opacity 220ms cubic-bezier(0.7, 0, 0.2, 1);
}
[data-modal-backdrop][data-state="open"] { opacity: 1; }
[data-modal-backdrop][data-state="closed"] { opacity: 0; }
@starting-style {
  [data-modal-backdrop][data-state="open"] { opacity: 0; }
}

[data-modal-panel] {
  transition-property: transform, opacity;
  transition-duration: 240ms;
  transition-timing-function: cubic-bezier(0.7, 0, 0.2, 1);
  transform-origin: center;
}
[data-modal-panel][data-state="open"] { opacity: 1; transform: scale(1); }
[data-modal-panel][data-state="closed"] { opacity: 0; transform: scale(0.96); }
@starting-style {
  [data-modal-panel][data-state="open"] { opacity: 0; transform: scale(0.96); }
}

@media (prefers-reduced-motion: reduce) {
  [data-modal-panel] {
    transition-duration: 180ms;
  }
  [data-modal-panel][data-state="closed"] { transform: none; }
  @starting-style {
    [data-modal-panel][data-state="open"] { transform: none; }
  }
}
```

Values from AUDIT.md:
- Backdrop 220 ms + panel 240 ms — both fit modal budget of 200–500 ms (§2), and land on the *fast* end matching the site's restraint.
- Panel `scale(0.96)` at rest (closed) — subtle, within the 0.9–0.97 target for scale-in entrances (§3). Never `scale(0)`.
- `transform-origin: center` — modals are the one exempt case per §3 (do not chase the trigger).
- Symmetric enter/exit timing — 240 ms in and 240 ms out. Symmetric because there is no user "hold" gesture here (§4).
- Reduced-motion: opacity remains, scale drops.

## Repo conventions to follow

- **Global styles** in `src/app/globals.css`. Component-scoped-ish CSS via `[data-*]` attribute selectors is already how the hamburger uses `clip-path` inline; matching that spirit. See `.overlay-enter-active` at `globals.css:80–83` for the exemplar of a "controlled by a piece of state written on the element" pattern.
- **useCallback + useState** are already used in `PrisestimatBuilder.tsx` — see `addEmptyRow` at `:40–54` for a `useCallback` example, and `useState` at `:26–38` for state variables.
- **Curve**: `cubic-bezier(0.7, 0, 0.2, 1)` inline. No new token.
- Do **not** introduce a motion library (Framer Motion, etc.) or a UI library modal (Radix Dialog, Base UI). Plain React + CSS.

## Steps

1. **Verify the imports at the top of `src/components/PrisestimatBuilder.tsx`.** The current line 3 reads:
   ```tsx
   import { useCallback, useEffect, useMemo, useRef, useState } from "react";
   ```
   All hooks needed by this plan (`useState`, `useCallback`) are already imported. No change.

2. **Replace the ModalShell body** at `PrisestimatBuilder.tsx:522–555` with the target implementation above (Target section, first code block). Preserve the exact function signature and props destructure — only the body changes.

3. **Open `src/app/globals.css`.** After the closing `}` of `@keyframes uline-back` (currently around line 187), and after the `@layer components` block added by plan 001, append the modal CSS block from the Target section (second code block) at top-level scope. Place these rules **outside** any `@layer` — the attribute selectors are specific enough that Tailwind's layer ordering won't fight them, and `@starting-style` behaves most reliably at top level.

## Boundaries

- Do **NOT** change any caller of `ModalShell`. Existing usages in `BrowseModal` (line 585) and `SummaryModal` (line 684) both call `<ModalShell onClose={onClose} title="..." >` — their signatures are unchanged. They receive the same `onClose` and pass it through; the shell now delays the actual invocation internally.
- Do **NOT** modify BrowseModal / SummaryModal / their contents.
- Do **NOT** add Escape-key handling in this plan (the current shell doesn't have it and adding it now is out of scope; if we want it, it's a separate plan).
- Do **NOT** touch focus trap, aria-modal, or other accessibility attributes. This plan is motion-only.
- Do **NOT** delay the parent's state update — `showBrowse` / `showSummary` flip synchronously; the delay lives inside ModalShell so any future modal user gets the animation for free.
- Do **NOT** put the modal CSS inside `@layer components` — top-level scope only.
- If the ModalShell function body has drifted from the excerpt above since commit `493f929`, STOP and report the drift.

## Verification

**Mechanical**
- `npx tsc --noEmit` — passes. Watch for missing `useCallback` or `useState` imports (both already present in this file).
- `npx next build` — 14 routes; `/prisestimat` bundle grows by <1 KB.

**Feel check** (`npm run dev` then `http://localhost:3000/prisestimat`)
- Click **Bla i prisliste**. Modal enters: backdrop fades in over 220 ms, panel scales from 0.96 → 1 with a fade, matching the swoop curve. No pop, no flash.
- Click the backdrop (outside the panel). Modal exits with the mirror animation: panel scales down + fades, backdrop fades — 240 ms total. Then the DOM unmounts.
- Click the `×` in the header. Same exit as backdrop click.
- Add at least one row to the prisestimat, then click **Se sammendrag →**. SummaryModal opens with the same animation (proves the shell is generic).
- Chrome DevTools → Animations panel, throttle playback to 10 %, click **Bla i prisliste**. Confirm: transform-origin looks like center (not shifted toward a trigger — modals stay centered by design per AUDIT §3), transform and opacity animate together, no jank.
- Rapidly spam-click **Bla i prisliste** → backdrop → **Bla i prisliste**. Because the outer parent state (`showBrowse`) has already unmounted between clicks, no ghost element sticks. The 240 ms exit + immediate re-mount will feel fluid; verify no visual flash of the previous panel.
- DevTools → Rendering → **prefers-reduced-motion: reduce** → open a modal. Confirm: opacity fade still runs, scale is gone (panel just appears at final size).

**Done when**
- ModalShell body matches the target implementation, with `state`, `requestClose`, and `data-*` attributes.
- Global CSS carries both `[data-modal-backdrop]` and `[data-modal-panel]` rule sets, both including `@starting-style` and reduced-motion variants.
- Both modals in the app (BrowseModal, SummaryModal) show a soft enter and a soft exit — verified by clicking each.
- `git diff --stat` shows exactly two files: `src/components/PrisestimatBuilder.tsx` (net ~+10 lines) and `src/app/globals.css` (~+30 lines).
