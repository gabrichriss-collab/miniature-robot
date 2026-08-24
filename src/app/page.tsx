import Link from "next/link";
import { services } from "@/data/services";
import { projects } from "@/data/projects";
import FeaturedProjectsMosaic from "@/components/FeaturedProjectsMosaic";

const processSteps = [
  {
    k: "01",
    t: "Forespørsel",
    b: "Du beskriver prosjektet — via kontaktskjema, telefon eller prisestimat-verktøyet."
  },
  {
    k: "02",
    t: "Befaring",
    b: "Vi kommer på befaring, ser på eksisterende forhold og går gjennom praktiske løsninger og materialer."
  },
  {
    k: "03",
    t: "Tilbud",
    b: "Du får et skriftlig tilbud med tydelig omfang, timepris og materialkostnader."
  },
  {
    k: "04",
    t: "Utførelse",
    b: "Arbeidet utføres etter avtalt løsning og fremdrift. Du får jevnlige oppdateringer underveis."
  },
  {
    k: "05",
    t: "Ferdigstillelse",
    b: "Vi går gjennom prosjektet sammen før overlevering og retter opp eventuelle merknader."
  }
];

const craftDetails = [
  { k: "Skjøter", b: "Presise treskjøter der de vises, skjulte innfestinger der de ikke skal vises." },
  { k: "Lufting", b: "Riktig luftespalte bak kledning og over isolasjon — huset må puste." },
  { k: "Tetting", b: "Vindsperre og dampsperre uten hull. Vannbrett som leder vann bort fra konstruksjon." },
  { k: "Overganger", b: "Der gammelt møter nytt — foringer, gerikter og beslag som holder over tid." }
];

export default function Home() {
  const primaryServices = services.slice(0, 6);
  const featured = projects.slice(0, 4);
  const hasRealProjects = projects.length > 0;

  return (
    <>
      {/* 1. HERO */}
      <section className="relative -mt-24 flex h-[100svh] w-full items-end overflow-hidden bg-ink text-bone">
        <div
          aria-hidden
          className="kenburns absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(/images/hero.jpg), linear-gradient(120deg, #1c1a17 0%, #3a3128 40%, #6b5b46 100%)"
          }}
        />
        <div
          aria-hidden
          className="grain-strong absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/45"
        />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[var(--page-max)] flex-col justify-end px-6 pb-16 md:px-10 md:pb-20">
          <p className="eyebrow rise rise-1 mb-6 text-bone/70">
            Bergen, Nordhordland og omegn
          </p>
          <h1 className="headline rise rise-2 text-[clamp(2rem,5vw,4.75rem)]">
            Forpliktet til perfeksjon.
            <br />
            For kommende generasjoner.
          </h1>
          <p className="rise rise-3 mt-6 max-w-xl text-bone/80">
            Tømrerarbeid, rehabilitering, tilbygg og utvendige arbeider —
            i Bergen og omegn.
          </p>
          <div className="rise rise-4 mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/kontakt?type=tilbud"
              className="group inline-flex items-center gap-3 border border-bone bg-bone px-7 py-4 eyebrow text-ink press hover:bg-transparent hover:text-bone"
            >
              Be om tilbud
              <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/prisestimat"
              className="group inline-flex items-center gap-3 eyebrow text-bone"
            >
              <span className="uline">Få prisestimat</span>
              <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURED REAL PROJECT — only if a real project exists */}
      {hasRealProjects && featured[0] ? (
        <section className="relative overflow-hidden bg-ink text-bone">
          <Link
            href={`/prosjekter/${featured[0].slug}`}
            className="group block"
          >
            <div
              className="relative flex min-h-[70svh] w-full items-end overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute inset-0 transition-transform duration-[1400ms] ease-swoop group-hover:scale-[1.03]"
                style={{
                  background: featured[0].gradient,
                  backgroundImage: featured[0].heroImage
                    ? `url(${featured[0].heroImage}), ${featured[0].gradient}`
                    : featured[0].gradient,
                  backgroundSize: "cover",
                  backgroundPosition: featured[0].heroImagePosition ?? "center"
                }}
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="relative z-10 mx-auto flex w-full max-w-[var(--page-max)] flex-col gap-8 px-6 py-20 md:flex-row md:items-end md:justify-between md:px-10 md:py-28">
                <div>
                  <p className="eyebrow text-bone/70">Utvalgt prosjekt</p>
                  <h2 className="headline mt-4 text-[clamp(2rem,5vw,4.5rem)]">
                    {featured[0].title}
                  </h2>
                  <p className="mt-3 text-bone/80">
                    {featured[0].category} · {featured[0].location}
                  </p>
                  {featured[0].shortDescription ? (
                    <p className="mt-6 max-w-xl text-bone/85">
                      {featured[0].shortDescription}
                    </p>
                  ) : null}
                </div>
                <span className="eyebrow uline self-end text-bone">
                  Se prosjekt →
                </span>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {/* 3. VI BYGGER I TRE — brand section */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">01 — Håndverket</p>
          </div>
          <div className="md:col-span-8">
            <h2 className="headline text-[clamp(2.25rem,5.5vw,4.75rem)]">
              Vi bygger i tre.
            </h2>
            <p className="mt-10 max-w-2xl text-lg text-ink/80">
              Vi er spesielt opptatt av detaljene som ikke alltid er synlige
              når prosjektet er ferdig — oppbygging, lufting, tetting,
              materialvalg og gode overganger. Det er der jobben avgjøres,
              og det er det som gir et hus lang levetid.
            </p>
            <Link href="/om-oss" className="uline mt-10 inline-block eyebrow">
              Om Tømrer Kawiche →
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[var(--page-max)] px-6 md:px-10">
        <div className="rule" />
      </div>

      {/* 4. SERVICES */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
        <div className="mb-16 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">02 — Tjenester</p>
            <h2 className="headline mt-6 text-[clamp(2.25rem,5vw,4.25rem)]">
              Det vi gjør.
            </h2>
          </div>
          <Link href="/tjenester" className="uline eyebrow">
            Alle tjenester →
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
          {primaryServices.map((s, i) => (
            <li key={s.slug}>
              <Link
                href={`/tjenester/${s.slug}`}
                className="group grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-ink/10 py-8 md:py-10"
              >
                <span className="eyebrow text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="headline text-3xl md:text-4xl">{s.title}</h3>
                  <p className="mt-3 text-ink/70">{s.lede}</p>
                  <span
                    aria-hidden
                    className="eyebrow mt-4 inline-block text-ink/50 transition-transform duration-500 ease-swoop group-hover:translate-x-1"
                  >
                    Les mer →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. SELECTED PROJECTS */}
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="eyebrow text-bone/70">03 — Prosjekter</p>
              <h2 className="headline mt-6 text-[clamp(2.25rem,5vw,4.25rem)]">
                Utvalgt arbeid.
              </h2>
            </div>
            {hasRealProjects ? (
              <Link href="/prosjekter" className="uline eyebrow text-bone/90">
                Alle prosjekter →
              </Link>
            ) : null}
          </div>
          {hasRealProjects ? (
            <FeaturedProjectsMosaic projects={featured} />
          ) : (
            <div className="border border-bone/15 py-24 text-center">
              <p className="eyebrow text-bone/60">
                Prosjektbilder legges ut fortløpende
              </p>
              <p className="mx-auto mt-6 max-w-md text-bone/75">
                Vi jobber nå med å samle og publisere ferdige prosjekter fra
                Bergen, Nordhordland og omegn. Ta gjerne kontakt for
                referanser i mellomtiden.
              </p>
              <Link
                href="/kontakt"
                className="uline mt-10 inline-block eyebrow text-bone"
              >
                Be om referanser →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 6. PRICE ESTIMATOR CTA */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">04 — Prisestimat</p>
          </div>
          <div className="md:col-span-8">
            <h2 className="headline text-[clamp(2rem,5vw,4.25rem)]">
              Lurer du på hva prosjektet kan koste?
            </h2>
            <p className="mt-8 max-w-2xl text-lg text-ink/80">
              Beskriv arbeidet linje for linje, så gir vi deg et veiledende
              prisestimat basert på våre normale satser. Estimatet er ikke
              bindende — endelig pris avtales etter befaring.
            </p>
            <Link
              href="/prisestimat"
              className="group mt-10 inline-flex items-center gap-3 border border-ink px-7 py-4 eyebrow press hover:bg-ink hover:text-bone"
            >
              Beregn pris
              <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. SLIK JOBBER VI */}
      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
          <div className="mb-14 flex flex-col gap-4 md:mb-20 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">05 — Prosess</p>
              <h2 className="headline mt-6 text-[clamp(2.25rem,5vw,4.25rem)]">
                Slik jobber vi.
              </h2>
            </div>
          </div>
          <ol className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((s) => (
              <li key={s.k}>
                <p className="eyebrow text-ink/40">{s.k}</p>
                <h3 className="headline mt-4 text-2xl md:text-3xl">{s.t}</h3>
                <p className="mt-3 text-ink/75">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 8. CRAFTSMANSHIP / DETAILS */}
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow text-bone/70">06 — Detaljer</p>
              <h2 className="headline mt-6 text-[clamp(2rem,5vw,4.25rem)]">
                Det som ikke vises.
              </h2>
              <p className="mt-8 max-w-md text-bone/75">
                De viktigste beslutningene på et byggeprosjekt tas før
                overflaten kommer på. Vi bruker tid der.
              </p>
            </div>
            <ul className="md:col-span-8 grid gap-10 md:grid-cols-2">
              {craftDetails.map((d, i) => (
                <li key={d.k} className="border-t border-bone/15 pt-8">
                  <p className="eyebrow text-bone/50">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="headline mt-3 text-2xl md:text-3xl">{d.k}</h3>
                  <p className="mt-3 text-bone/80">{d.b}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* TODO: ADD REAL DETAIL PHOTOGRAPHS (close-ups of joints, flashing, transitions) — drop under public/images/details/ and render a small grid here */}
        </div>
      </section>

      {/* 9. ABOUT PREVIEW */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">07 — Om oss</p>
          </div>
          <div className="md:col-span-8">
            <h2 className="headline text-[clamp(2rem,5vw,4.25rem)]">
              Håndverket bak Tømrer Kawiche.
            </h2>
            <p className="mt-8 max-w-2xl text-lg text-ink/80">
              Tømrer Kawiche er bygget rundt nøye utførelse, praktiske
              løsninger og arbeid som er ment å vare. Bak firmaet står
              Gabriel Kawiche — som tar oppdrag der han kan følge jobben
              hele veien, fra første befaring til siste kontroll.
            </p>
            <Link
              href="/om-oss"
              className="uline mt-10 inline-block eyebrow"
            >
              Om Tømrer Kawiche →
            </Link>
          </div>
        </div>
      </section>

      {/* 10. REVIEWS — empty state until real testimonials */}
      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-24 md:px-10 md:py-32">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow">08 — Omtaler</p>
              <h2 className="headline mt-6 text-[clamp(2rem,4.5vw,3.5rem)]">
                Ord fra kundene.
              </h2>
            </div>
          </div>
          {/* TODO: ADD REAL CUSTOMER TESTIMONIALS — replace this empty state with a two- or three-column quote grid once verified reviews are collected */}
          <div className="border border-ink/10 py-16 text-center">
            <p className="eyebrow text-ink/50">
              Vi samler omtaler fra kunder
            </p>
            <p className="mx-auto mt-6 max-w-md text-ink/70">
              Vi legger ut kundeomtaler etter hvert som de kommer inn. Ta
              gjerne kontakt for å få referanser fra tidligere prosjekter.
            </p>
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
        <div className="rule mb-16" />
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div>
            <h2 className="headline text-[clamp(2.25rem,7vw,5.5rem)]">
              Har du et prosjekt i tankene?
            </h2>
            <p className="mt-6 max-w-xl text-ink/75">
              Send en kort beskrivelse, så tar vi kontakt for befaring eller
              tilbud.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/kontakt?type=tilbud"
              className="group inline-flex items-center gap-3 border border-ink bg-ink px-7 py-4 eyebrow text-bone press hover:bg-transparent hover:text-ink"
            >
              Start forespørsel
              <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/prisestimat"
              className="group inline-flex items-center gap-3 eyebrow text-ink"
            >
              <span className="uline">Få prisestimat</span>
              <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
