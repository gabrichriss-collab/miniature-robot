import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Personvern",
  description:
    "Slik behandler Tømrer Kawiche personopplysninger, informasjonskapsler og henvendelser via nettsiden."
};

const sections: Array<{ h: string; body: React.ReactNode }> = [
  {
    h: "Behandlingsansvarlig",
    body: (
      <p>
        {site.legalName}, org.&nbsp;nr.&nbsp;{site.orgNumber}, {site.address.street},{" "}
        {site.address.postal} {site.address.city}, {site.address.countryName}, er
        behandlingsansvarlig for personopplysninger som samles inn via denne
        nettsiden. Kontakt oss på{" "}
        <a className="uline" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        .
      </p>
    )
  },
  {
    h: "Hvilke opplysninger vi samler inn",
    body: (
      <ul className="ml-4 list-disc space-y-2">
        <li>
          Opplysninger du selv oppgir i kontaktskjemaet: navn, e-post, telefon,
          emne og melding.
        </li>
        <li>
          Teknisk informasjon knyttet til henvendelsen: tidspunkt, IP-adresse og
          nettleser (kun for å hindre misbruk og feilsøke).
        </li>
        <li>
          Vi bruker <strong>ingen</strong> analyse- eller sporingskapsler, og
          har <strong>ingen</strong> tredjepartssporing på nettsiden.
        </li>
      </ul>
    )
  },
  {
    h: "Formål og rettslig grunnlag",
    body: (
      <p>
        Opplysningene brukes til å besvare henvendelser og gi tilbud. Rettslig
        grunnlag er personvernforordningen (GDPR) art.&nbsp;6&nbsp;nr.&nbsp;1
        bokstav b (avtale/tiltak før avtaleinngåelse) og bokstav f (berettiget
        interesse i å drive og sikre virksomheten).
      </p>
    )
  },
  {
    h: "Lagringstid",
    body: (
      <p>
        Henvendelser lagres så lenge det er nødvendig for å håndtere forespørselen
        og eventuelt påfølgende oppdrag, normalt inntil tre år etter siste
        kontakt. Etter dette slettes eller anonymiseres opplysningene.
      </p>
    )
  },
  {
    h: "Deling med andre",
    body: (
      <p>
        Vi deler ikke personopplysninger med tredjeparter, med mindre det er
        nødvendig for å levere et oppdrag (f.&nbsp;eks. samarbeidende arkitekt
        eller underleverandør), eller der vi er pålagt å gjøre det etter norsk
        lov. Nettsiden hostes på infrastruktur innenfor EU/EØS.
      </p>
    )
  },
  {
    h: "Dine rettigheter",
    body: (
      <p>
        Du har rett til innsyn, retting, sletting, begrensning og dataportabilitet
        etter personvernforordningen. Send en e-post til{" "}
        <a className="uline" href={`mailto:${site.email}`}>
          {site.email}
        </a>{" "}
        om du ønsker å benytte deg av disse rettighetene. Du kan også klage til{" "}
        <a
          className="uline"
          href="https://www.datatilsynet.no"
          rel="noopener noreferrer"
          target="_blank"
        >
          Datatilsynet
        </a>
        .
      </p>
    )
  },
  {
    h: "Informasjonskapsler",
    body: (
      <p>
        Nettsiden bruker kun tekniske, funksjonelle kapsler som er nødvendige
        for at siden skal fungere. Vi setter ingen kapsler for markedsføring eller
        analyse, og du trenger derfor ikke å samtykke til noe for å bruke
        nettsiden.
      </p>
    )
  }
];

export default function PersonvernPage() {
  const updated = new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date());
  return (
    <>
      <PageHeader
        kicker="Personvern"
        title="Åpen om data."
        lede="Kort og forståelig om hvordan vi behandler personopplysninger på denne nettsiden — etter GDPR og norsk personopplysningslov."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        <div className="grid gap-14 md:grid-cols-12">
          <aside className="md:col-span-4">
            <p className="eyebrow text-ink/60">Sist oppdatert</p>
            <p className="mt-3 text-ink/80">{updated}</p>
            <ul className="mt-10 space-y-3">
              {sections.map((s, i) => (
                <li key={s.h} className="flex gap-4 text-sm text-ink/70">
                  <span className="eyebrow text-ink/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a href={`#s-${i + 1}`} className="uline">
                    {s.h}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
          <div className="md:col-span-8 space-y-14">
            {sections.map((s, i) => (
              <article key={s.h} id={`s-${i + 1}`}>
                <p className="eyebrow text-ink/50">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="headline mt-3 text-3xl md:text-4xl">{s.h}</h2>
                <div className="mt-6 space-y-4 text-ink/85">{s.body}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
