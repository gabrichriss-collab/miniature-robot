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
    b: "Vi bygger uten hastverk. En riktig skjøt tar den tiden den tar."
  },
  {
    k: "02",
    t: "Materiale",
    b: "Vi jobber i tre — og lar det vise seg som det er. Aldring er en kvalitet."
  },
  {
    k: "03",
    t: "Presisjon",
    b: "Millimeter betyr noe. Alt vi bygger måles, tegnes og prøvemonteres."
  },
  {
    k: "04",
    t: "Nærhet",
    b: "Vi er få. Byggherren kjenner oss ved navn — og møter oss på plassen."
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
        lede="Tømrer Kawiche ble grunnlagt i 2011 av tømrermester Kawiche N., med utgangspunkt i én overbevisning: at bygg fortsatt kan lages med hånd, hode og hjerte i samme rom."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-24 md:px-10 md:pb-32">
        <div className="rule mb-16" />
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Historien</p>
          </div>
          <div className="md:col-span-8 space-y-6 text-lg text-ink/80">
            <p>
              Vi startet i et lite verksted i Myking med to snekkerbenker og en
              høvelmaskin arvet fra Kawiches bestefar. De første oppdragene var
              dører og trapper til nabolagets gårder rundt Nordhordland. Rykte
              spredte seg — stille, slik det gjør blant håndverkere.
            </p>
            <p>
              I dag er vi tolv, med et større verksted, mer utstyr og de samme
              prinsippene. Vi tar prosjekter der vi kan holde hånden om
              helheten — fra tegning til den siste skruen.
            </p>
            <p>
              Vi tror at et hus, en benk eller en dør skal kunne repareres av
              den neste generasjonen. Vi bygger for barnebarn vi ikke har møtt.
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
