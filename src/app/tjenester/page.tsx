import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Tjenester",
  description:
    "Rehabilitering, tilbygg, terrasse, fasade, vinduer og innvendige arbeider i Bergen, Nordhordland og omegn."
};

export default function TjenesterPage() {
  return (
    <>
      <PageHeader
        kicker="Tjenester"
        title="Det vi gjør."
        lede="Vi tar hele jobben fra befaring til overlevering — rehab, tilbygg, terrasse, fasade, vinduer og innvendige arbeider. Alt starter med en samtale og en gjennomgang av prosjektet."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        <ul className="grid gap-x-10 md:grid-cols-2">
          {services.map((s, i) => (
            <li key={s.slug}>
              <Link
                href={`/tjenester/${s.slug}`}
                className="group grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-ink/10 py-10 md:py-12"
              >
                <span className="eyebrow text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="headline text-3xl md:text-4xl">{s.title}</h2>
                  <p className="mt-3 max-w-lg text-ink/75">{s.lede}</p>
                  <span
                    aria-hidden
                    className="eyebrow mt-5 inline-block text-ink/50 transition-transform duration-500 ease-swoop group-hover:translate-x-1"
                  >
                    Les mer →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-20 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="max-w-lg text-ink/75">
            Har prosjektet flere elementer? De fleste jobber overlapper — vi
            tar rollen som ansvarlig håndverker og koordinerer det som
            trengs.
          </p>
          <Link
            href="/kontakt?type=tilbud"
            className="group inline-flex items-center gap-3 border border-ink px-7 py-4 eyebrow press hover:bg-ink hover:text-bone"
          >
            Be om tilbud
            <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
