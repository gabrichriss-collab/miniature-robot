import type { MetadataRoute } from "next";
import { services } from "@/data/services";
import { projects } from "@/data/projects";

const staticRoutes = [
  "",
  "/tjenester",
  "/prosjekter",
  "/prisestimat",
  "/om-oss",
  "/kontakt",
  "/personvern"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tomrerkawiche.no";
  const now = new Date();

  const dynamicRoutes = [
    ...services.map((s) => `/tjenester/${s.slug}`),
    ...projects.map((p) => `/prosjekter/${p.slug}`)
  ];

  return [...staticRoutes, ...dynamicRoutes].map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : r.startsWith("/tjenester/") ? 0.8 : 0.7
  }));
}
