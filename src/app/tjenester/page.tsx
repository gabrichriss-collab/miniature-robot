import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { services } from "@/data/services";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tjenester",
  description:
    "Nybygg, tilbygg, interiør, rehabilitering og rådgivning — bygget i tre av Tømrer Kawiche."
};

export default function TjenesterPage() {
  return (
    <>
      <PageHeader
        kicker="Tjenester"
        title="Det vi gjør."
        lede="Vi tar oppdrag fra idé til overlevering. Alle prosjekter — enten det er en spisebordsbenk eller en enebolig — starter med en samtale og en befaring."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        <div className="grid gap-y-24 md:gap-y-32">
          {services.map((s, i) => (
            <article
              key={s.slug}
              id={s.slug}
              className="grid gap-10 md:grid-cols-12"
            >
              <div className="md:col-span-4">
                <p className="eyebrow text-ink/60">{s.kicker}</p>
                <h2 className="headline mt-6 text-4xl md:text-6xl">
                  {s.title}
                </h2>
              </div>
              <div className="md:col-span-7 md:col-start-6">
                <p className="max-w-2xl text-lg text-ink/80">{s.lede}</p>
                <ul className="mt-10 grid gap-4 md:grid-cols-2">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-baseline gap-3 border-t border-ink/10 pt-4 text-ink/85"
                    >
                      <span className="eyebrow text-ink/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/kontakt"
                  className="uline mt-10 inline-block eyebrow"
                >
                  Snakk med oss →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
