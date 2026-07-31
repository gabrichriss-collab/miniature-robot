import type { MetadataRoute } from "next";

const routes = [
  "",
  "/tjenester",
  "/prosjekter",
  "/om-oss",
  "/baerekraft",
  "/karriere",
  "/kontakt"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tomrerkawiche.no";
  const now = new Date();
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.7
  }));
}
