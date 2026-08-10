import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Bærekraft",
  description:
    "Vår tilnærming til materialer, energi og et bygg som skal vare i generasjoner."
};

const pillars = [
  {
    k: "01",
    t: "Materialer med opprinnelse",
    b: "Vi kjøper tre fra sagbruk vi kjenner. Vi vet hvor skogen står og hvem som har foredlet det."
  },
  {
    k: "02",
    t: "Lang levetid",
    b: "Vi bygger slik at ting kan repareres — ikke skiftes ut. Skjøter kan tas fra hverandre, og enkeltdeler kan byttes."
  },
  {
    k: "03",
    t: "Lavere fotavtrykk",
    b: "Tre binder karbon. Vi velger massivtre og trebaserte løsninger der det passer, og fører enkelt regnskap på det vi bruker."
  },
  {
    k: "04",
    t: "Sunt inneklima",
    b: "Overflatene våre er stort sett olje, såpe, lin og kalk. Ingen skjult kjemi — bare valg vi kan stå for."
  }
];

export default function BaerekraftPage() {
  return (
    <>
      <PageHeader
        kicker="Bærekraft"
        title="Å bygge for lang tid."
        lede="For oss handler bærekraft først og fremst om levetid: hvor lenge huset står, hvor lett det kan repareres, og hvor mye det tåler før noe må skiftes."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Fire pilarer</p>
          </div>
          <div className="md:col-span-8 grid gap-12 md:grid-cols-2">
            {pillars.map((p) => (
              <article key={p.k}>
                <p className="eyebrow text-ink/50">{p.k}</p>
                <h3 className="headline mt-4 text-3xl md:text-4xl">{p.t}</h3>
                <p className="mt-4 text-ink/80">{p.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-28 md:px-10 md:py-40">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow text-bone/70">I praksis</p>
            </div>
            <div className="md:col-span-8">
              <h2 className="headline text-4xl md:text-6xl">
                Vi måler, dokumenterer og deler.
              </h2>
              <p className="mt-8 max-w-2xl text-bone/80">
                Hvert prosjekt får et enkelt materialregnskap: hvor treet
                kommer fra, hvor mye CO₂e det binder, og hva som skjer med
                overskuddet. Restene går til mindre møbler, prøvebiter og
                lærlingoppgaver.
              </p>
              <dl className="mt-14 grid grid-cols-2 gap-8 md:grid-cols-3">
                {[
                  { k: "92%", v: "Tre fra Norden" },
                  { k: "78%", v: "Rester gjenbrukt" },
                  { k: "0", v: "Farlige lakker på verksted" }
                ].map((x) => (
                  <div key={x.v}>
                    <dt className="headline text-5xl md:text-6xl">{x.k}</dt>
                    <dd className="mt-3 eyebrow text-bone/60">{x.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
