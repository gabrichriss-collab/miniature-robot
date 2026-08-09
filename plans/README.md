# Animation plans

Self-contained implementation plans produced by the `improve-animations` skill. Each plan is executable by any agent (or human) with zero prior context — every value, every file:line, every verification step is inlined.

## Index

| # | Title | Severity | Status | Blocked by |
|---|---|---|---|---|
| 001 | [Universal press feedback (`.press` utility)](./001-universal-press-feedback.md) | MEDIUM | DONE | — |

## Execution order

1. **001** — do first. Zero dependencies, touches five files, near-invisible motion but a real perceived-quality upgrade. Establishes the `.press` utility that follow-up plans (row enter/exit, modal open/close, auto-match badge, projects mosaic reveal) will build alongside.

## Running a plan

```bash
# Any capable coding agent — Claude Code, Codex, Cursor, etc.
# Point it at the plan file and let it follow the Steps section verbatim.
```

Plans are pinned to a commit sha at the top. If the repo has drifted, the plan's own Boundaries section tells the executor to stop rather than improvise.

## Conventions

- Numeric prefix `NNN-` is monotonic — pick the next unused number for new plans.
- Slug is short-imperative kebab-case.
- Each plan lists explicit **Boundaries** so an executor can't scope-creep.
- Every recipe animates **`transform` + `opacity` only**, reuses the site's single canonical curve `cubic-bezier(0.7, 0, 0.2, 1)` (`ease-swoop` in `tailwind.config.ts`), and handles `prefers-reduced-motion: reduce` with a gentler variant rather than removing motion entirely.
