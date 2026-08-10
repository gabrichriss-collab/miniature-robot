import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Om oss",
  description: "Historien, verdiene og menneskene bak Tømrer Kawiche."
};

const values = [
  {
    k: "01",
    t: "Tid",
    b: "Vi tar oss tiden en jobb faktisk trenger. Ikke lenger, ikke kortere."
  },
  {
    k: "02",
    t: "Materiale",
    b: "Vi jobber i tre. Vi lar det se ut som tre — og vi lar det få lov til å eldes."
  },
  {
    k: "03",
    t: "Presisjon",
    b: "Vi måler og tegner før vi kutter. Fastinnredning prøvemonteres på verkstedet før det havner hos deg."
  },
  {
    k: "04",
    t: "Nærhet",
    b: "Vi er få, og det er meningen. Du snakker med dem som gjør jobben — ikke gjennom flere ledd."
  }
];

const team = [
  { name: "Kawiche N.", role: "Grunnlegger, tømrermester" },
  { name: "Marte S.", role: "Byggeleder" },
  { name: "Ole T.", role: "Snekker, verksted" },
  { name: "Halvor R.", role: "Snekker, montasje" },
  { name: "Ingrid H.", role: "Prosjektering" },
  { name: "Torbjørn A.", role: "Lærling" }
];

export default function OmOssPage() {
  return (
    <>
      <PageHeader
        kicker="Om oss"
        title="Et lite verksted i Nordhordland."
        lede="Vi startet i 2011. Kawiche N. er tømrermester og driver firmaet — resten av oss har kommet til underveis."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-24 md:px-10 md:pb-32">
        <div className="rule mb-16" />
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Historien</p>
          </div>
          <div className="md:col-span-8 space-y-6 text-lg text-ink/80">
            <p>
              Vi begynte i et lite verksted i Myking med to snekkerbenker og
              en gammel høvelmaskin. De første jobbene var dører og trapper
              til nabogårdene her i Nordhordland. Så kom det flere.
            </p>
            <p>
              I dag er vi tolv, med et større verksted og mer utstyr. Vi tar
              oppdrag der vi kan følge hele veien — fra tegneark til siste
              skru.
            </p>
            <p>
              Vi bygger slik at det kan repareres seinere, ikke skiftes ut.
              Det er en av grunnene til at vi liker å jobbe i tre.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
          <p className="eyebrow mb-16 text-bone/70">Verdier</p>
          <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <article key={v.k}>
                <p className="eyebrow text-bone/50">{v.k}</p>
                <h3 className="headline mt-4 text-4xl">{v.t}</h3>
                <p className="mt-4 text-bone/75">{v.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
        <div className="mb-16 flex items-end justify-between">
          <p className="eyebrow">Teamet</p>
          <p className="text-sm text-ink/60">Tolv håndverkere · Nordhordland</p>
        </div>
        <ul className="grid grid-cols-1 gap-x-10 md:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <li
              key={m.name}
              className="flex items-baseline justify-between border-t border-ink/10 py-6"
            >
              <div>
                <p className="headline text-2xl md:text-3xl">{m.name}</p>
                <p className="mt-1 text-sm text-ink/60">{m.role}</p>
              </div>
              <span className="eyebrow text-ink/40">
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
