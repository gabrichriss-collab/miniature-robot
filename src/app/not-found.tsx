import Link from "next/link";

export const metadata = {
  title: "Siden finnes ikke"
};

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80svh] max-w-[var(--page-max)] flex-col justify-center px-6 py-40 md:px-10">
      <p className="eyebrow mb-8">404 — Feil spor</p>
      <h1 className="headline text-[clamp(3rem,10vw,9rem)]">
        Denne siden
        <br />
        er ikke bygget.
      </h1>
      <p className="mt-10 max-w-xl text-lg text-ink/80">
        Adressen finnes ikke — eller så er den flyttet. Vend tilbake til
        forsiden, eller ta kontakt om du leter etter noe spesielt.
      </p>
      <div className="mt-12 flex flex-wrap gap-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-4 border border-ink px-8 py-5 eyebrow transition-colors hover:bg-ink hover:text-bone"
        >
          Til forsiden
          <span
            aria-hidden
            className="transition-transform duration-500 ease-swoop group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
        <Link href="/kontakt" className="uline eyebrow self-center">
          Kontakt oss →
        </Link>
      </div>
    </section>
  );
}
