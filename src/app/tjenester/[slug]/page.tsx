import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { services } from "@/data/services";
import { site } from "@/lib/site";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) return { title: "Tjeneste" };
  const title = `${service.title} — ${site.positioning}`;
  return {
    title,
    description: service.lede,
    openGraph: { title, description: service.lede },
    twitter: { title, description: service.lede }
  };
}

export default function ServicePage({ params }: Params) {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) notFound();

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        kicker={service.kicker}
        title={service.title}
        lede={service.lede}
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-24 md:px-10">
        <div className="rule mb-16" />
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Om tjenesten</p>
          </div>
          <div className="md:col-span-8">
            <p className="max-w-2xl text-lg text-ink/85">{service.intro}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-24 md:px-10">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Typisk omfang</p>
          </div>
          <ul className="md:col-span-8 grid gap-4 md:grid-cols-2">
            {service.typicalScope.map((s, i) => (
              <li
                key={s}
                className="flex items-baseline gap-3 border-t border-ink/10 pt-4 text-ink/85"
              >
                <span className="eyebrow text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-24 md:px-10 md:py-32">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow text-bone/70">Materialer & løsninger</p>
            </div>
            <ul className="md:col-span-8 grid gap-4 md:grid-cols-2">
              {service.materials.map((m) => (
                <li
                  key={m}
                  className="border-t border-bone/15 pt-4 text-bone/85"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-24 grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow text-bone/70">Tekniske hensyn</p>
            </div>
            <ul className="md:col-span-8 grid gap-4 md:grid-cols-2">
              {service.technical.map((t) => (
                <li
                  key={t}
                  className="border-t border-bone/15 pt-4 text-bone/85"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--page-max)] px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">Hva påvirker prisen</p>
          </div>
          <ul className="md:col-span-8 grid gap-4 md:grid-cols-2">
            {service.priceFactors.map((p, i) => (
              <li
                key={p}
                className="flex items-baseline gap-3 border-t border-ink/10 pt-4 text-ink/85"
              >
                <span className="eyebrow text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {service.faq.length > 0 && (
        <section className="mx-auto max-w-[var(--page-max)] px-6 py-24 md:px-10 md:py-32">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow">Vanlige spørsmål</p>
            </div>
            <dl className="md:col-span-8 space-y-10">
              {service.faq.map((f) => (
                <div key={f.q}>
                  <dt className="headline text-2xl md:text-3xl">{f.q}</dt>
                  <dd className="mt-3 max-w-2xl text-ink/80">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-24 md:px-10 md:py-32">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <h2 className="headline max-w-2xl text-[clamp(2rem,5vw,3.75rem)]">
              Klar for {service.title.toLowerCase()}?
            </h2>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/prisestimat"
                className="group inline-flex items-center gap-3 border border-ink px-7 py-4 eyebrow press hover:bg-ink hover:text-bone"
              >
                Få prisestimat
                <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href={`/kontakt?type=tilbud&tjeneste=${encodeURIComponent(service.title)}`}
                className="group inline-flex items-center gap-3 border border-ink bg-ink px-7 py-4 eyebrow text-bone press hover:bg-transparent hover:text-ink"
              >
                Be om tilbud
                <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-[var(--page-max)] px-6 pb-24 md:px-10 md:pb-32">
          <p className="eyebrow mb-8 text-ink/60">Andre tjenester</p>
          <ul className="grid gap-x-10 md:grid-cols-3">
            {related.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/tjenester/${s.slug}`}
                  className="group block border-t border-ink/10 py-8"
                >
                  <h3 className="headline text-2xl md:text-3xl">{s.title}</h3>
                  <p className="mt-3 text-sm text-ink/70">{s.lede}</p>
                  <span
                    aria-hidden
                    className="eyebrow mt-5 inline-block text-ink/50 transition-transform duration-500 ease-swoop group-hover:translate-x-1"
                  >
                    Les mer →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
