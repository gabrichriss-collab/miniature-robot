import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Prosjekter",
  description: "Utvalgte prosjekter fra Tømrer Kawiche — bolig, tilbygg, interiør, rehab, næring."
};

export default function ProsjekterPage() {
  return (
    <>
      <PageHeader
        kicker="Prosjekter"
        title="Bygget arbeid."
        lede="Et utvalg jobber vi har levert de siste årene. Klikk deg gjennom for detaljer om sted, størrelse og materialbruk."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        <div className="grid grid-cols-12 gap-8">
          {projects.map((p, i) => {
            const patterns = [
              "col-span-12 md:col-span-8",
              "col-span-12 md:col-span-4",
              "col-span-12 md:col-span-5",
              "col-span-12 md:col-span-7",
              "col-span-12 md:col-span-6",
              "col-span-12 md:col-span-6"
            ];
            return (
              <article
                key={p.slug}
                id={p.slug}
                className={`${patterns[i % patterns.length]} group`}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: i % 2 === 0 ? "4 / 3" : "3 / 4" }}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-[1400ms] ease-swoop group-hover:scale-[1.05]"
                    style={{ background: p.gradient }}
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
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <p className="text-ink/80">{p.summary}</p>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-ink/70">
                    <dt className="eyebrow text-ink/50">Sted</dt>
                    <dd>{p.place}</dd>
                    <dt className="eyebrow text-ink/50">Størrelse</dt>
                    <dd>{p.size}</dd>
                    <dt className="eyebrow text-ink/50">Materialer</dt>
                    <dd>{p.material}</dd>
                  </dl>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
