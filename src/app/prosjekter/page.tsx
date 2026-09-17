import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Prosjekter",
  description:
    "Utvalgte prosjekter fra Tømrer Kawiche i Bergen, Nordhordland og omegn."
};

const patterns = [
  "col-span-12 md:col-span-8",
  "col-span-12 md:col-span-4",
  "col-span-12 md:col-span-5",
  "col-span-12 md:col-span-7",
  "col-span-12 md:col-span-6",
  "col-span-12 md:col-span-6"
];

export default function ProsjekterPage() {
  const hasRealProjects = projects.length > 0;

  return (
    <>
      <PageHeader
        kicker="Prosjekter"
        title="Bygget arbeid."
        lede="Et utvalg jobber vi har levert. Hvert prosjekt vises som case study — med utgangspunkt, løsning, utførelse og resultat."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        {hasRealProjects ? (
          <div className="grid grid-cols-12 gap-8">
            {projects.map((p, i) => (
              <article
                key={p.slug}
                id={p.slug}
                className={`${patterns[i % patterns.length]} group`}
              >
                <Link href={`/prosjekter/${p.slug}`} className="block">
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: i % 2 === 0 ? "4 / 3" : "3 / 4" }}
                  >
                    <div
                      className="absolute inset-0 transition-transform duration-[1400ms] ease-swoop group-hover:scale-[1.05]"
                      style={{
                        background: p.gradient,
                        backgroundImage: p.heroImage
                          ? `url(${p.heroImage}), ${p.gradient}`
                          : p.gradient,
                        backgroundSize: "cover",
                        backgroundPosition: p.heroImagePosition ?? "center"
                      }}
                      aria-hidden
                    />
                    <div
                      aria-hidden
                      className="noise absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
                    />
                    <div className="relative z-10 flex h-full flex-col justify-end p-6 text-bone md:p-8">
                      <p className="eyebrow text-bone/70">
                        {p.category} · {p.year}
                      </p>
                      <h2 className="headline mt-3 text-3xl md:text-5xl">
                        {p.title}
                      </h2>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <p className="text-ink/80">{p.shortDescription}</p>
                    <p className="text-sm text-ink/60 md:text-right">
                      {p.location}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-ink/10 py-24 text-center">
            <p className="eyebrow text-ink/50">
              Prosjektbilder legges ut fortløpende
            </p>
            <p className="mx-auto mt-6 max-w-md text-ink/70">
              Vi jobber nå med å publisere ferdige prosjekter fra Bergen,
              Nordhordland og omegn. I mellomtiden kan du be om referanser
              direkte.
            </p>
            <Link
              href="/kontakt"
              className="uline mt-10 inline-block eyebrow"
            >
              Be om referanser →
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
