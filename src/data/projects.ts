/**
 * Real projects only. Add entries here as photos and permission from the
 * customer are in place. Empty by design — the UI on `/prosjekter` and
 * the homepage falls back to an empty state until the first real case
 * study lands.
 *
 * When adding a project, drop images under `public/images/projects/<slug>/`
 * and reference them with paths like `/images/projects/villaX/hero.jpg`.
 */

export type ProjectCategory =
  | "Rehabilitering"
  | "Tilbygg"
  | "Terrasse & uterom"
  | "Fasade"
  | "Vinduer & dører"
  | "Innvendig";

export type Project = {
  slug: string;
  title: string;
  /** General location — e.g. "Alver" or "Bergen Nord". Never a private street address. */
  location: string;
  /** e.g. "2025". Year of completion or "Pågående". */
  year: string;
  category: ProjectCategory;
  /** One-sentence card summary. */
  shortDescription: string;
  /** Path under /public to the hero photograph. If missing, the gradient shows as a fallback. */
  heroImage?: string;
  /** Optional focal alignment for the hero image. */
  heroImagePosition?: string;
  /** Before / underveis / ferdig image paths under /public. Each optional. */
  beforeImages?: string[];
  processImages?: string[];
  finishedImages?: string[];
  /** Case-study body sections. All optional — omit what does not apply. */
  challenge?: string;
  solution?: string;
  execution?: string;
  details?: string;
  /** Related services (slugs from services.ts) for internal linking. */
  services?: string[];
  /** Wood-toned gradient used as visual fallback when no hero image is present. */
  gradient: string;
};

/**
 * TODO: ADD REAL PROJECTS
 *
 * When Tømrer Kawiche has verified case-study material, add entries below.
 * Do NOT invent projects to fill the grid — the empty state is the
 * honest default until real work + photos are ready.
 */
export const projects: Project[] = [];
