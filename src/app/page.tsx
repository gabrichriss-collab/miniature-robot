import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import ServicesSlider from "@/components/ServicesSlider";
import { projects } from "@/data/projects";

export default function Home() {
  const featured = projects.slice(0, 4);
  return (
    <>
      <HeroSlider />

      {/* Manifesto */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">01 — Manifest</p>
          </div>
          <div className="md:col-span-8">
            <h2 className="headline text-[clamp(2.25rem,5.5vw,4.75rem)]">
              Vi bygger med tre.
              <br />
              Rolig, presist og for lang tid.
            </h2>
            <p className="mt-10 max-w-2xl text-lg text-ink/80">
              Tømrer Kawiche er et lite verksted i Oslo. Vi tegner, planlegger
              og bygger boliger, tilbygg og spesialsnekkerier i tre — fra det
              første strekstroket i skissen til den siste finpussen av
              overflaten. Vårt håndverk er stille. Det viser seg i skjøtene,
              i vekten på en dør, i hvordan et hus møter grunnen.
            </p>
            <Link
              href="/om-oss"
              className="uline mt-10 inline-block eyebrow"
            >
              Les mer om oss →
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[var(--page-max)] px-6 md:px-10">
        <div className="rule" />
      </div>

      {/* Services — Multiform-inspired horizontal slider */}
      <ServicesSlider />

      {/* Featured projects — mosaic */}
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
          <div className="mb-16 flex items-end justify-between">
            <p className="eyebrow text-bone/70">03 — Utvalgte prosjekter</p>
            <Link href="/prosjekter" className="uline eyebrow text-bone/90">
              Alle prosjekter →
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-12">
            {featured.map((p, i) => (
              <Link
                key={p.slug}
                href={`/prosjekter#${p.slug}`}
                className={`group relative block overflow-hidden ${
                  i % 3 === 0
                    ? "md:col-span-7 md:row-span-2"
                    : "md:col-span-5"
                }`}
                style={{ aspectRatio: i % 3 === 0 ? "4 / 3" : "5 / 4" }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-[1200ms] ease-swoop group-hover:scale-[1.04]"
                  style={{ background: p.gradient }}
                  aria-hidden
                />
                <div
                  aria-hidden
                  className="noise absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
                />
                <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-10">
                  <p className="eyebrow text-bone/70">
                    {p.category} · {p.year}
                  </p>
                  <h3 className="headline mt-3 text-3xl md:text-5xl">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-bone/70">{p.place}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers / trust */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">04 — Verkstedet i tall</p>
          </div>
          <div className="md:col-span-8">
            <dl className="grid gap-10 md:grid-cols-3">
              {[
                { k: "12", v: "Håndverkere" },
                { k: "2011", v: "Grunnlagt" },
                { k: "180+", v: "Fullførte prosjekter" }
              ].map((x) => (
                <div key={x.v}>
                  <dt className="headline text-6xl md:text-7xl">{x.k}</dt>
                  <dd className="mt-3 eyebrow text-ink/60">{x.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Trust markers */}
      <section className="border-y border-ink/10">
        <div className="mx-auto grid max-w-[var(--page-max)] gap-10 px-6 py-14 md:grid-cols-4 md:px-10">
          {[
            { k: "Tømrermester", v: "Mesterbrev og fagbrev i tømrerfaget" },
            {
              k: "Sentral godkjenning",
              v: "Utførelse av tømrerarbeid — klasse 2"
            },
            {
              k: "Byggmesterforbundet",
              v: "Medlem — bransjeetikk og seriøsitet"
            },
            {
              k: "Ansvarlig virksomhet",
              v: "MVA-registrert · yrkesskadeforsikring · HMS"
            }
          ].map((t) => (
            <div key={t.k}>
              <p className="eyebrow text-ink/60">{t.k}</p>
              <p className="mt-3 text-sm text-ink/80">{t.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 pt-28 md:px-10 md:pb-40 md:pt-40">
        <div className="rule mb-16" />
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <h2 className="headline text-[clamp(2.25rem,7vw,6rem)]">
            Skal vi bygge sammen?
          </h2>
          <Link
            href="/kontakt"
            className="group inline-flex items-center gap-4 border border-ink px-8 py-5 eyebrow transition-colors hover:bg-ink hover:text-bone"
          >
            Ta kontakt
            <span
              aria-hidden
              className="transition-transform duration-500 ease-swoop group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
