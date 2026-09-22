import Link from "next/link";
import { site } from "@/lib/site";
import LinkArrow from "./LinkArrow";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-bone/10 bg-fog text-bone">
      <div className="mx-auto grid max-w-[var(--page-max)] gap-14 px-6 py-20 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <p className="eyebrow mb-6 text-bone">TØMRER KAWICHE</p>
          <p className="headline text-4xl md:text-5xl">
            Bygget for å vare.
            <br />
            Bygget her i Vestland.
          </p>
          <p className="mt-8 max-w-md text-bone/80">
            Basert i Myking, Nordhordland. Vi bygger boliger, tilbygg og
            innredning i tre — for kunder i Alver, Osterøy, Bergen og resten
            av Vestland.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow mb-4 text-bone/65">Verksted</p>
          <address className="not-italic text-bone/90">
            {site.address.street}
            <br />
            {site.address.postal} {site.address.city}, {site.address.countryName}
          </address>
          <p className="mt-6 text-bone/90">
            <a className="uline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <br />
            <a className="uline" href={site.phoneHref}>
              {site.phone}
            </a>
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow mb-4 text-bone/65">Sidekart</p>
          <ul className="space-y-2 text-bone/90">
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
              <Link className="uline" href="/prisestimat">
                Prisestimat
              </Link>
            </li>
            <li>
              <Link className="uline" href="/om-oss">
                Om oss
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
          {/* Sosiale lenker.
              Samme tynne streksprak som slideren og menymerket: statisk
              1,25 px hairline i stedet for .uline-sveipen, og den lille
              pila som flytter seg 4 px paa hover.

              space-y-4 i stedet for space-y-2: med py-2 blir hver lenke
              45 px hoey, og 16 px luft er det som skal til for at de to
              trykkfeltene IKKE overlapper hverandre. -my-2 nuller ut
              polstringen visuelt, saa raden ser like tett ut som foer.

              Streken er border-b (1 px), ikke 1,25 px som i SVG-merkene:
              nettleseren runder rammebredder til hele piksler, saa 1,25
              px her ville uansett blitt tegnet som 1 px. 1 px er ogsaa
              vekten .uline bruker ellers paa nettstedet. De tegnede
              merkene beholder 1,25 px via non-scaling-stroke, som ikke
              rundes. */}
          <p className="eyebrow mb-4 text-bone/65">Følg oss</p>
          <ul className="space-y-4 text-bone/90">
            <li>
              <a
                className="group -my-2 inline-flex items-center gap-2.5 py-2"
                href={site.social.instagram}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="border-b border-bone/30 pb-0.5 transition-colors duration-500 ease-swoop group-hover:border-bone/80">
                  Instagram
                </span>
                <LinkArrow />
              </a>
            </li>
            <li>
              <a
                className="group -my-2 inline-flex items-center gap-2.5 py-2"
                href={site.social.linkedin}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="border-b border-bone/30 pb-0.5 transition-colors duration-500 ease-swoop group-hover:border-bone/80">
                  LinkedIn
                </span>
                <LinkArrow />
              </a>
            </li>
          </ul>
          <p className="eyebrow mb-4 mt-10 text-bone/65">Juridisk</p>
          <ul className="space-y-2 text-bone/90">
            <li>
              <Link className="uline" href="/personvern">
                Personvern
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-bone/15">
        <div className="mx-auto flex max-w-[var(--page-max)] flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-bone/70 md:flex-row md:items-center md:px-10">
          <p>© {year} {site.legalName}. Alle rettigheter reservert.</p>
          <p className="eyebrow">
            Org.&nbsp;nr. {site.orgNumber} · MVA-registrert
          </p>
        </div>
      </div>
    </footer>
  );
}
