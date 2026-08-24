import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Om oss",
  description:
    "Håndverket bak Tømrer Kawiche — bygget rundt nøye utførelse, praktiske løsninger og arbeid som er ment å vare."
};

const philosophy = [
  {
    k: "01",
    t: "Forarbeidet",
    b: "Vi bruker tid på befaring, planlegging og materialvalg før første spiker treffer. Det gjør jobben roligere når den først går."
  },
  {
    k: "02",
    t: "Utførelsen",
    b: "Ett prosjekt av gangen. Du snakker med samme håndverker fra befaring til overlevering — ingen mellomledd."
  },
  {
    k: "03",
    t: "Detaljene",
    b: "Skjulte innfestinger, riktig lufting, tette overganger. De valgene som ikke synes når huset er ferdig, men som avgjør levetiden."
  },
  {
    k: "04",
    t: "Materialene",
    b: "Vi jobber først og fremst i tre. Vi velger materialer som eldes riktig og som kan repareres seinere om det trengs."
  }
];

/**
 * TODO: VERIFY QUALIFICATIONS
 *
 * Only list items that Gabriel Kawiche actually holds. Confirm each of
 * these before publishing — do not add unverified certifications.
 */
const qualifications = [
  { t: "Svennebrev", b: "Fagbrev i tømrerfaget." },
  { t: "8+ års erfaring", b: "Nybygg og rehabilitering." },
  { t: "HMS", b: "Grunnkurs i HMS for utøvende arbeid." },
  { t: "Varme arbeider", b: "Sertifikat for varme arbeider." },
  { t: "Lift", b: "Sertifikat for personløfter (klasse B)." }
];

export default function OmOssPage() {
  return (
    <>
      <PageHeader
        kicker="Om oss"
        title="Håndverket bak Tømrer Kawiche."
        lede="Tømrer Kawiche er bygget rundt nøye utførelse, praktiske løsninger og arbeid som er ment å vare. Vi tar oppdrag der vi kan følge jobben hele veien — fra første befaring til siste kontroll."
      />

      {/* Gabriel intro */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-24 md:px-10 md:pb-32">
        <div className="rule mb-16" />
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Bak firmaet</p>
          </div>
          <div className="md:col-span-8 space-y-6 text-lg text-ink/85">
            <p>
              Gabriel Kawiche er tømreren bak firmaet. Han tar oppdrag i
              Bergen, Nordhordland og omegn — fra mindre snekkerarbeid til
              tilbygg og rehabilitering.
            </p>
            <p>
              Kombinasjonen av åtte års erfaring med både nybygg og rehab
              gjør at han kjenner byggemåten fra flere epoker — og vet hva
              som fungerer når nytt skal møte gammelt.
            </p>
            <p>
              Firmaet tar én jobb av gangen. Du snakker med Gabriel selv
              gjennom hele prosjektet — planlegging, utførelse og
              ferdigstillelse.
            </p>
            {/* TODO: ADD REAL WORKING/PROJECT PHOTO OF GABRIEL — replace this note with a working photograph rather than a corporate portrait */}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-24 md:px-10 md:py-32">
          <p className="eyebrow mb-16 text-bone/70">Filosofien</p>
          <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
            {philosophy.map((v) => (
              <article key={v.k}>
                <p className="eyebrow text-bone/50">{v.k}</p>
                <h3 className="headline mt-4 text-3xl md:text-4xl">{v.t}</h3>
                <p className="mt-4 text-bone/75">{v.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Kvalifikasjoner</p>
            <p className="mt-6 max-w-sm text-ink/70">
              Bare verifiserte kvalifikasjoner — dokumentasjon kan sendes
              på forespørsel.
            </p>
          </div>
          <ul className="md:col-span-8 grid gap-6 md:grid-cols-2">
            {qualifications.map((q) => (
              <li key={q.t} className="border-t border-ink/10 pt-5">
                <p className="headline text-2xl">{q.t}</p>
                <p className="mt-2 text-sm text-ink/70">{q.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Signature */}
      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-24 md:px-10 md:pb-32">
        <div className="rule mb-16" />
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <p className="headline text-[clamp(1.75rem,4vw,3rem)] italic text-ink/80">
            Spread love for a good handverk.
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
