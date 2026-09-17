# Animation plans

Self-contained implementation plans produced by the `improve-animations` skill. Each plan is executable by any agent (or human) with zero prior context — every value, every file:line, every verification step is inlined.

## Index

| # | Title | Severity | Status | Blocked by |
|---|---|---|---|---|
| 001 | [Universal press feedback (`.press` utility)](./001-universal-press-feedback.md) | MEDIUM | DONE | — |
| 002 | [Prisestimat row enter animation](./002-prisestimat-row-enter.md) | MEDIUM | DONE | — |
| 003 | [Modal open/close for BrowseModal + SummaryModal](./003-modal-open-close.md) | MEDIUM | DONE | — |
| 004 | [Auto-match badge fade-in](./004-automatch-badge-fade.md) | LOW | DONE | — |
| 005 | [Projects mosaic scroll-in stagger](./005-projects-mosaic-reveal.md) | LOW | DONE | — |

## Execution order

Recommended, though plans are independent — you can execute them in any order:

1. **001** — DONE. Established `.press` and the pattern of "utility class in `globals.css`, replace a `transition-*` string, done".
2. **002** — prisestimat row enter. Highest remaining leverage; the builder is the site's most interactive surface, and rows currently teleport in.
3. **003** — modal open/close. Second-highest leverage; refactors ModalShell to hold DOM through exit, benefits BrowseModal + SummaryModal in one go.
4. **004** — auto-match badge fade. Small, safe polish. Complements 002 (both live in the row).
5. **005** — projects mosaic scroll-in stagger. New client component, one-time scroll trigger, only fires once per visit.

None of the plans depend on each other; each is stand-alone. If two are executed in parallel, only 002 and 004 touch overlapping files (`PrisestimatBuilder.tsx` and `globals.css`) but at different lines — merges cleanly.

## Running a plan

```bash
# Any capable coding agent — Claude Code, Codex, Cursor, etc.
# Point it at the plan file and let it follow the Steps section verbatim.
```

Plans are pinned to a commit sha at the top. If the repo has drifted, each plan's own **Boundaries** section tells the executor to stop rather than improvise.

## Conventions

- Numeric prefix `NNN-` is monotonic — pick the next unused number for new plans.
- Slug is short-imperative kebab-case.
- Each plan lists explicit **Boundaries** so an executor can't scope-creep.
- Every recipe animates **`transform` + `opacity` only**, reuses the site's single canonical curve `cubic-bezier(0.7, 0, 0.2, 1)` (`ease-swoop` in `tailwind.config.ts`), and handles `prefers-reduced-motion: reduce` with a gentler variant rather than removing motion entirely.
- `@starting-style` and attribute-selector CSS rules live at **top-level** in `globals.css`, not inside `@layer components`, to avoid Tailwind layer ordering suppressing them.
