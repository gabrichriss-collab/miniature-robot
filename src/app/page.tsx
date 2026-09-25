import { getImageProps } from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import FeaturedProjectsMosaic from "@/components/FeaturedProjectsMosaic";
import ServicesSlider from "@/components/ServicesSlider";
import UnderConstructionBanner from "@/components/UnderConstructionBanner";

const processSteps = [
  {
    t: "Forespørsel",
    b: "Du beskriver prosjektet — via kontaktskjema, telefon eller prisestimat-verktøyet."
  },
  {
    t: "Befaring",
    b: "Vi kommer på befaring, ser på eksisterende forhold og går gjennom praktiske løsninger og materialer."
  },
  {
    t: "Tilbud",
    b: "Du får et skriftlig tilbud med tydelig omfang, timepris og materialkostnader."
  },
  {
    t: "Utførelse",
    b: "Arbeidet utføres etter avtalt løsning og fremdrift. Du får jevnlige oppdateringer underveis."
  },
  {
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

/* Hero-bildet, se kommentaren ved "Bildelag" i hero-en. */
const HERO_PORTRAIT_MEDIA = "(max-aspect-ratio: 1/1)";
const heroCommon = { alt: "", fill: true, priority: true, quality: 80 } as const;
const { props: heroPortrait } = getImageProps({
  ...heroCommon,
  src: "/images/hero-portrait.jpg",
  // 3:4-bilde med cover i en 100vh-boks: 75vh bredt naar skjermen er
  // smalere enn 3:4 (alle telefoner), ellers fyller det bredden.
  sizes: "(max-aspect-ratio: 3/4) 75vh, 100vw"
});
const { props: heroLandscape } = getImageProps({
  ...heroCommon,
  src: "/images/hero.jpg",
  // 16:9-bilde med cover: 178vh bredt naar skjermen er smalere enn 16:9.
  sizes: "(max-aspect-ratio: 16/9) 178vh, 100vw"
});

export default function Home() {
  const featured = projects.slice(0, 4);
  const hasRealProjects = projects.length > 0;

  return (
    <>
      {/* 1. HERO */}
      <section className="relative -mt-24 flex h-[100svh] w-full items-end overflow-hidden bg-ink text-bone">
        {/* Bildelag. Fotografiet ligger oppaa gradienten, som staar igjen
            som reserve mens bildet lastes.

            To utsnitt av samme foto (kunstnerisk styring via <picture>):
            - hero-portrait.jpg (3:4) til staaende skjermer. Hero-en er
              100svh hoey, saa et liggende 16:9-foto ville vist en smal
              stripe paa ca. 1/4 av bredden — og fordi optimalisereren
              velger bredde etter viewport, ville den stripen blitt
              forstoerret nesten 4x og sett uskarp ut.
            - hero.jpg (16:9) til alt som er bredere enn kvadratisk.
            sizes beskriver hvor bredt bildet faktisk TEGNES med
            object-cover i en 100vh-boks, ikke viewport-bredden, slik at
            optimalisereren leverer nok piksler til utsnittet.

            Filteret — litt dempet metning og kontrollert kontrast — tar
            iPhone-fotoets HDR-preg ned mot resten av nettstedet.

            Gradienten er stemt mot materialene i profilen: groennsvart i
            skyggen, varm tommer opp mot lyset, forankret i PROSENT
            (78%/22%) slik at den holder seg paa plass i alle formater. */}
        <div
          aria-hidden
          className="kenburns absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(125% 95% at 78% 20%, #8a7357 0%, #6a5741 22%, #453a2b 46%, #262219 72%, #15160f 100%)"
          }}
        >
          <picture>
            <source media={HERO_PORTRAIT_MEDIA} srcSet={heroPortrait.srcSet} sizes={heroPortrait.sizes} />
            {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" kommer fra getImageProps; bildet er dekorativt bak h1 */}
            <img
              {...heroLandscape}
              className="object-cover [object-position:62%_55%] [@media(max-aspect-ratio:1/1)]:[object-position:45%_50%]"
              style={{ ...heroLandscape.style, filter: "saturate(0.94) contrast(1.05)" }}
            />
          </picture>
        </div>

        {/* Skyggelag. Retningsbestemt: tyngst nede der overskriften staar,
            lett oppe slik at hero-en ikke blir unoedig moerk. Vignetten
            legger til den lille optiske fallen mot hjoernene som skiller et
            fotografert motiv fra en flat CSS-gradient. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.34) 34%, rgba(10,10,10,0.12) 62%, rgba(10,10,10,0.3) 100%), radial-gradient(118% 88% at 50% 38%, transparent 42%, rgba(10,10,10,0.42) 100%)"
          }}
        />

        {/* Kornlag — ligger over baade bilde og skygge slik at de to
            smelter sammen til én flate i stedet for to. */}
        <div aria-hidden className="grain absolute inset-0" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[var(--page-max)] flex-col justify-end px-6 pb-16 md:px-10 md:pb-20">
          <h1 className="headline rise rise-2 text-[clamp(2rem,5vw,4.75rem)]">
            Forpliktet til perfeksjon.
            <br />
            For kommende generasjoner.
          </h1>
        </div>
      </section>

      {/* Utviklingsstripe — rett etter hero-en, ingen luft imellom. */}
      <UnderConstructionBanner />

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
          <div className="md:col-span-10 md:col-start-2">
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

      {/* 4. SERVICES — Multiform-inspired horizontal slider */}
      <section className="py-28 md:py-40">
        <div className="mx-auto mb-14 flex max-w-[var(--page-max)] flex-col gap-8 px-6 md:mb-20 md:flex-row md:items-end md:justify-between md:px-10">
          <div>
            <h2 className="headline text-[clamp(2.25rem,5vw,4.25rem)]">
              Det vi gjør.
            </h2>
          </div>
          <Link href="/tjenester" className="uline eyebrow">
            Alle tjenester →
          </Link>
        </div>
        <ServicesSlider />
      </section>

      {/* 5. SELECTED PROJECTS */}
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <h2 className="headline text-[clamp(2.25rem,5vw,4.25rem)]">
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
          <div className="md:col-span-10 md:col-start-2">
            <h2 className="headline text-[clamp(2rem,5vw,4.25rem)]">
              Lurer du på hva prosjektet kan koste?
            </h2>
            <p className="mt-8 max-w-2xl text-lg text-ink/80">
              Beskriv arbeidet linje for linje, så gir vi deg et veiledende
              prisestimat basert på prosjektets størrelse, valgte løsninger og
              opplysningene du legger inn. Estimatet er ikke bindende — endelig
              pris avtales etter befaring.
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
              <h2 className="headline text-[clamp(2.25rem,5vw,4.25rem)]">
                Slik jobber vi.
              </h2>
            </div>
          </div>
          <ol className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((s) => (
              <li key={s.t}>
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
              <h2 className="headline text-[clamp(2rem,5vw,4.25rem)]">
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
                  <h3 className="headline text-2xl md:text-3xl">{d.k}</h3>
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
          <div className="md:col-span-10 md:col-start-2">
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
              <h2 className="headline text-[clamp(2rem,4.5vw,3.5rem)]">
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
