# 002 — Prisestimat row enter animation

- **Status**: DONE
- **Commit**: `493f929`
- **Severity**: MEDIUM
- **Category**: Interruptibility + Physicality & origin (bridge a teleporting state)
- **Estimated scope**: 2 files, ~15 lines total (1 CSS block + 1 className swap)

## Problem

In the prisestimat builder, rows appear instantly when the user clicks **+ Ny post** or picks an item from the **Bla i prisliste** modal. It's the classic "list item added with no bridge" seam: the container is a slow, considered document-builder, but each row snaps into being with no visual continuity.

Verified at commit `493f929`:

```tsx
// src/components/PrisestimatBuilder.tsx:277–285 — where rows render
{rows.map((row, i) => (
  <RowItem
    key={row.id}
    row={row}
    index={i}
    updateRow={updateRow}
    deleteRow={deleteRow}
  />
))}
```

```tsx
// src/components/PrisestimatBuilder.tsx:405–410 — root of the RowItem
return (
  <div
    className={`grid grid-cols-1 gap-2 py-5 md:grid-cols-[1fr_5rem_6rem_7rem_8rem_2.5rem] md:items-center md:gap-4 ${
      index !== 0 ? "border-t border-ink/10" : ""
    }`}
  >
```

No `transition`, no entry style. The first row (`index === 0`) appearing after the empty state also snaps — the "Bare begynn å skrive." empty block disappears and a fully-formed row lands in its place. Both moments benefit from the same recipe.

Exit (row × delete) is deliberately **not** covered by this plan. AUDIT.md §4 endorses asymmetric timing: destructive confirms are the user's deliberate action; the system's response should snap. Exit stays instant.

## Target

A `.row-enter` utility class on the RowItem root that uses `@starting-style` for a browserless-JS entry: the row starts slightly above and lightly scaled down at zero opacity, then transitions to its final position.

```css
/* target — appended inside the existing @layer components block in src/app/globals.css */
.row-enter {
  transition-property: transform, opacity;
  transition-duration: 260ms;
  transition-timing-function: cubic-bezier(0.7, 0, 0.2, 1);
}
@starting-style {
  .row-enter {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }
}
@media (prefers-reduced-motion: reduce) {
  .row-enter {
    transition-duration: 200ms;
  }
  @starting-style {
    .row-enter {
      transform: none;
    }
  }
}
```

Attach `row-enter` to the RowItem root `<div>`.

Values pulled from `.agents/skills/improve-animations/AUDIT.md`:
- 260ms fits between dropdown (150–250ms) and modal (200–500ms) — appropriate for a list-item entrance
- `cubic-bezier(0.7, 0, 0.2, 1)` — the repo's single canonical curve, same as `.press`, `.uline`, and `.rise` (AUDIT §7 cohesion)
- Never `scale(0)` — starts at `scale(0.98)` per §3
- Reduced-motion keeps the opacity fade but drops the translate — gentler, not zero (§6)

`@starting-style` is supported in Chrome/Edge 117+, Safari 17.5+, Firefox 129+. Fallback behaviour on older browsers is that the row appears in its final state — same behaviour as today. No regression.

## Repo conventions to follow

- **Global styles** live in `src/app/globals.css`. Extend the existing `@layer components` block that already contains `.press` (added by plan 001, `globals.css:189–207`). Do not create a new `@layer`.
- **Utility class naming**: existing utilities like `.press`, `.uline`, `.rise`, `.headline`, `.eyebrow` are single lower-case words or hyphenated. `.row-enter` follows that convention.
- **Curve**: use `cubic-bezier(0.7, 0, 0.2, 1)` inline, not a new token. See `.press` for the exemplar.
- **Never animate `width`, `height`, `margin`, `padding`, `top`, `left`** — transform + opacity only (AUDIT §5).
- Do **not** introduce a motion library, do **not** touch `tailwind.config.ts`.

## Steps

1. **Open `src/app/globals.css`.** After the closing `}` of the `.press` component block (currently around line 207, inside the existing `@layer components`), append the following **inside that same `@layer components`**:
   ```css
   .row-enter {
     transition-property: transform, opacity;
     transition-duration: 260ms;
     transition-timing-function: cubic-bezier(0.7, 0, 0.2, 1);
   }
   ```
   Then **outside** the `@layer components` block (after its closing `}`), add:
   ```css
   @starting-style {
     .row-enter {
       opacity: 0;
       transform: translateY(-6px) scale(0.98);
     }
   }
   @media (prefers-reduced-motion: reduce) {
     .row-enter {
       transition-duration: 200ms;
     }
     @starting-style {
       .row-enter {
         transform: none;
       }
     }
   }
   ```
   The `@starting-style` and `@media` rules are placed at the top level (not inside `@layer components`) because both work fine at global scope and reading them there matches how other keyframes like `rise` and `kenburns` are declared.

2. **`src/components/PrisestimatBuilder.tsx:405–410`** — in the RowItem root `<div>`, add `row-enter` to the className. The full className becomes:
   ```tsx
   className={`row-enter grid grid-cols-1 gap-2 py-5 md:grid-cols-[1fr_5rem_6rem_7rem_8rem_2.5rem] md:items-center md:gap-4 ${
     index !== 0 ? "border-t border-ink/10" : ""
   }`}
   ```

## Boundaries

- Do **NOT** modify the row exit / delete path. `deleteRow` at `PrisestimatBuilder.tsx:101` and the `×` button at `:467–474` stay as they are. Instant delete is deliberate.
- Do **NOT** modify the empty-state block at `PrisestimatBuilder.tsx:255–264` (the "Bare begynn å skrive." panel). It disappears when the first row is added; the row's own enter animation is the bridge.
- Do **NOT** touch the RowItem's inputs, auto-match badge, or delete button — those have their own concerns.
- Do **NOT** put the `@starting-style` inside `@layer components` — Tailwind's layer ordering can suppress starting-style rules in some browsers if buried inside a component layer. Keep it at top level.
- Do **NOT** add a motion library. Do **NOT** modify `tailwind.config.ts`.
- If step 1's insertion point ambiguity arises (multiple `@layer components` blocks, drift since commit `493f929`), STOP and report.

## Verification

**Mechanical**
- `npx tsc --noEmit` — passes.
- `npx next build` — 14 routes, `/prisestimat` size delta <1 KB.

**Feel check** (`npm run dev` then `http://localhost:3000/prisestimat`)
- Click **+ Ny post** — new row fades in from `translateY(-6px) scale(0.98)` to settled. Not a slam.
- Click **+ Ny post** rapidly five times — each new row runs its own entry cleanly, none abort mid-way (CSS transitions retarget).
- Open **Bla i prisliste** and pick an entry — the added row runs the same entrance.
- Delete a row with `×` — row disappears **instantly**. No fade-out. This is intentional (asymmetric timing per AUDIT §4).
- Open Chrome DevTools → Animations panel, throttle to 10 %, click **+ Ny post**. Watch: transform + opacity animate together over 260 ms with the swoop curve.
- DevTools → Rendering → toggle **Emulate CSS media feature `prefers-reduced-motion: reduce`** → click **+ Ny post**. Confirm: the translate is gone but the row still fades in over 200 ms. Movement dampened, not eliminated.
- Chrome ≥ 117 required for the `@starting-style` to fire; in older browsers the row appears instantly (no regression from today's behaviour).

**Done when**
- `.row-enter` is defined in `globals.css` with the exact values above.
- The RowItem root has `row-enter` prepended to its className.
- `git diff --stat` shows exactly two files touched: `src/app/globals.css` (+16 lines), `src/components/PrisestimatBuilder.tsx` (+1 word in className).
- All five feel-check bullets pass.
