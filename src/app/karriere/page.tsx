import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Karriere",
  description: "Ledige stillinger og lærlingplasser hos Tømrer Kawiche."
};

const positions = [
  {
    slug: "tomrer",
    title: "Tømrer",
    type: "Fast · 100%",
    place: "Myking · Verksted og plass",
    body: "Vi søker en erfaren tømrer med fagbrev, som liker å jobbe presist og selvstendig. Både verksted og montasje."
  },
  {
    slug: "snekker",
    title: "Møbelsnekker",
    type: "Fast · 100%",
    place: "Myking · Verksted",
    body: "Til fastmøbler og spesialsnekring. Erfaring fra finér, massivtre og oljede overflater."
  },
  {
    slug: "laerling",
    title: "Lærling",
    type: "2 år · Lærekontrakt",
    place: "Myking",
    body: "Vi tar inn én lærling pr. år. Rolig opplæring, mesterlig oppfølging."
  }
];

export default function KarrierePage() {
  return (
    <>
      <PageHeader
        kicker="Karriere"
        title="Bli med i verkstedet."
        lede="Vi er et lite team og vokser sakte. Vi ansetter når vi kan gi ny kollega tid, plass og skikkelig oppfølging."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        <ul className="grid gap-2">
          {positions.map((p, i) => (
            <li key={p.slug}>
              <details className="group border-b border-ink/15 py-8">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-8">
                  <div className="grid grid-cols-[3rem_1fr] items-baseline gap-6">
                    <span className="eyebrow text-ink/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="headline text-4xl md:text-6xl">{p.title}</h2>
                  </div>
                  <span className="hidden text-right md:block">
                    <p className="eyebrow text-ink/50">{p.type}</p>
                    <p className="text-sm text-ink/70">{p.place}</p>
                  </span>
                  <span
                    aria-hidden
                    className="ml-4 text-2xl text-ink/50 transition-transform duration-500 ease-swoop group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="mt-6 grid gap-6 pl-[4.5rem] md:grid-cols-12">
                  <p className="md:col-span-7 text-ink/80">{p.body}</p>
                  <div className="md:col-span-4 md:col-start-9">
                    <Link
                      href={`/kontakt?rolle=${encodeURIComponent(p.title)}`}
                      className="uline eyebrow"
                    >
                      Søk stillingen →
                    </Link>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>

        <div className="mt-20 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Åpen søknad</p>
          </div>
          <div className="md:col-span-8">
            <p className="max-w-2xl text-lg text-ink/80">
              Vi tar imot åpne søknader året rundt. Skriv noen ord om deg, og
              legg gjerne ved bilder av arbeid du er stolt av.
            </p>
            <Link
              href="/kontakt?rolle=Åpen%20søknad"
              className="uline mt-8 inline-block eyebrow"
            >
              Send åpen søknad →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
