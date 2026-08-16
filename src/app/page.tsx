import Link from "next/link";
import ServicesSlider from "@/components/ServicesSlider";
import FeaturedProjectsMosaic from "@/components/FeaturedProjectsMosaic";
import { projects } from "@/data/projects";

export default function Home() {
  const featured = projects.slice(0, 4);
  return (
    <>
      {/* Static hero — dark wood-toned background, big headline, subtle Ken Burns */}
      <section className="relative -mt-24 flex h-[100svh] w-full items-end overflow-hidden bg-ink text-bone">
        <div
          aria-hidden
          className="kenburns absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, #1c1a17 0%, #3a3128 40%, #6b5b46 100%)"
          }}
        />
        <div
          aria-hidden
          className="noise absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-ink/40"
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[var(--page-max)] flex-col justify-end px-6 pb-16 md:px-10 md:pb-20">
          <h1 className="headline rise rise-2 text-[clamp(3rem,10vw,9rem)]">
            Vi streber for generasjoner.
          </h1>
          <div className="rise rise-4 mt-16 flex items-end justify-end md:mt-24">
            <Link
              href="/prisestimat"
              className="group inline-flex items-center gap-3 eyebrow text-bone"
            >
              <span className="uline">Beregn prisestimat</span>
              <span
                aria-hidden
                className="transition-transform duration-500 ease-swoop group-hover:translate-x-1"
              >
                ↓
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">01 — Manifest</p>
          </div>
          <div className="md:col-span-8">
            <h2 className="headline text-[clamp(2.25rem,5.5vw,4.75rem)]">
              Vi bygger i tre.
              <br />
              Og vi bruker den tiden det tar.
            </h2>
            <p className="mt-10 max-w-2xl text-lg text-ink/80">
              Tømrer Kawiche holder til i Myking i Nordhordland. Vi er tolv
              folk som tegner, planlegger og bygger — fra det første
              tegnearket til siste skru. Vi tar oppdrag vi kan følge fra
              start til slutt, og vi jobber helst med tre. Detaljene der
              gammelt møter nytt er der jobben avgjøres.
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
          <FeaturedProjectsMosaic projects={featured} />
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
            className="group inline-flex items-center gap-4 border border-ink px-8 py-5 eyebrow press hover:bg-ink hover:text-bone"
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
