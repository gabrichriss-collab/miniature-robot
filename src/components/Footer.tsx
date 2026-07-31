import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/10 bg-bone">
      <div className="mx-auto grid max-w-[var(--page-max)] gap-14 px-6 py-20 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <p className="eyebrow mb-6">TØMRER KAWICHE</p>
          <p className="headline text-4xl md:text-5xl">
            Bygget for å vare.
            <br />
            Formet for å berøre.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow mb-4 text-ink/50">Studio</p>
          <address className="not-italic text-ink/80">
            Tømrerveien 12
            <br />
            0000 Oslo, Norge
          </address>
          <p className="mt-6 text-ink/80">
            post@tomrerkawiche.no
            <br />
            +47 900 00 000
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow mb-4 text-ink/50">Sidekart</p>
          <ul className="space-y-2 text-ink/80">
            <li>
              <Link className="uline" href="/tjenester">
                Tjenester
              </Link>
            </li>
            <li>
              <Link className="uline" href="/prosjekter">
                Prosjekter
              </Link>
            </li>
            <li>
              <Link className="uline" href="/om-oss">
                Om oss
              </Link>
            </li>
            <li>
              <Link className="uline" href="/baerekraft">
                Bærekraft
              </Link>
            </li>
            <li>
              <Link className="uline" href="/karriere">
                Karriere
              </Link>
            </li>
            <li>
              <Link className="uline" href="/kontakt">
                Kontakt
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow mb-4 text-ink/50">Følg</p>
          <ul className="space-y-2 text-ink/80">
            <li>
              <a
                className="uline"
                href="https://instagram.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                className="uline"
                href="https://linkedin.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-[var(--page-max)] flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-ink/60 md:flex-row md:items-center md:px-10">
          <p>© {year} Tømrer Kawiche AS. Alle rettigheter reservert.</p>
          <p className="eyebrow">Org. nr. 000 000 000 — MVA</p>
        </div>
      </div>
    </footer>
  );
}
