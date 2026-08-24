import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { site } from "@/lib/site";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return { title: "Prosjekt" };
  const title = `${project.title} — ${project.category}`;
  return {
    title,
    description: project.shortDescription,
    openGraph: { title, description: project.shortDescription }
  };
}

function ImageStrip({
  images,
  eyebrow
}: {
  images: string[];
  eyebrow: string;
}) {
  return (
    <section className="mx-auto max-w-[var(--page-max)] px-6 py-14 md:px-10 md:py-20">
      <p className="eyebrow mb-6 text-ink/60">{eyebrow}</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.map((src, i) => (
          <div
            key={`${eyebrow}-${i}`}
            className="relative overflow-hidden bg-stone/40"
            style={{ aspectRatio: "4 / 3" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${eyebrow} ${i + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProjectPage({ params }: Params) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const before = project.beforeImages ?? [];
  const process = project.processImages ?? [];
  const finished = project.finishedImages ?? [];

  return (
    <>
      {/* Hero */}
      <section className="relative -mt-24 flex h-[90svh] w-full items-end overflow-hidden bg-ink text-bone">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: project.gradient,
            backgroundImage: project.heroImage
              ? `url(${project.heroImage}), ${project.gradient}`
              : project.gradient,
            backgroundSize: "cover",
            backgroundPosition: project.heroImagePosition ?? "center"
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/25"
        />
        <div className="relative z-10 mx-auto flex w-full max-w-[var(--page-max)] flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
          <p className="eyebrow mb-4 text-bone/70">
            {project.category} · {project.location} · {project.year}
          </p>
          <h1 className="headline text-[clamp(2.5rem,7vw,5.5rem)]">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-bone/85">
            {project.shortDescription}
          </p>
        </div>
      </section>

      {/* Sections */}
      {project.challenge && (
        <section className="mx-auto max-w-[var(--page-max)] px-6 py-20 md:px-10 md:py-28">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow text-ink/60">01 — Utgangspunktet</p>
            </div>
            <p className="md:col-span-8 max-w-2xl text-lg text-ink/85">
              {project.challenge}
            </p>
          </div>
        </section>
      )}

      {before.length > 0 && <ImageStrip eyebrow="Før" images={before} />}

      {project.solution && (
        <section className="mx-auto max-w-[var(--page-max)] px-6 py-20 md:px-10 md:py-28">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow text-ink/60">02 — Løsningen</p>
            </div>
            <p className="md:col-span-8 max-w-2xl text-lg text-ink/85">
              {project.solution}
            </p>
          </div>
        </section>
      )}

      {project.execution && (
        <section className="mx-auto max-w-[var(--page-max)] px-6 py-20 md:px-10 md:py-28">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="eyebrow text-ink/60">03 — Utførelsen</p>
            </div>
            <p className="md:col-span-8 max-w-2xl text-lg text-ink/85">
              {project.execution}
            </p>
          </div>
        </section>
      )}

      {process.length > 0 && (
        <ImageStrip eyebrow="Underveis" images={process} />
      )}

      {project.details && (
        <section className="bg-ink text-bone">
          <div className="mx-auto max-w-[var(--page-max)] px-6 py-20 md:px-10 md:py-28">
            <div className="grid gap-14 md:grid-cols-12">
              <div className="md:col-span-4">
                <p className="eyebrow text-bone/70">04 — Detaljene</p>
              </div>
              <p className="md:col-span-8 max-w-2xl text-lg text-bone/85">
                {project.details}
              </p>
            </div>
          </div>
        </section>
      )}

      {finished.length > 0 && <ImageStrip eyebrow="Ferdig" images={finished} />}

      {/* CTA */}
      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-[var(--page-max)] px-6 py-24 md:px-10 md:py-32">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <h2 className="headline max-w-2xl text-[clamp(2rem,5vw,3.75rem)]">
              Vurderer du et lignende prosjekt?
            </h2>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/prisestimat"
                className="uline eyebrow"
              >
                Få prisestimat →
              </Link>
              <Link
                href={`/kontakt?type=tilbud&prosjekt=${encodeURIComponent(project.title)}`}
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
    </>
  );
}
