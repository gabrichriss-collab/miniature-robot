import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Ta kontakt med Tømrer Kawiche i Myking, Nordhordland — vi svarer innen én virkedag."
};

export default function KontaktPage({
  searchParams
}: {
  searchParams?: { rolle?: string };
}) {
  const prefillRole = searchParams?.rolle;
  return (
    <>
      <PageHeader
        kicker="Kontakt"
        title="La oss snakke."
        lede="En e-post eller en telefon holder for å komme i gang. Vi kommer gjerne på befaring i Nordhordland, Bergen og resten av Vestland — helt uforpliktende."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4 space-y-10">
            <div>
              <p className="eyebrow mb-4 text-ink/60">Verksted</p>
              <address className="not-italic text-lg text-ink/85">
                {site.address.street}
                <br />
                {site.address.postal} {site.address.city}, {site.address.countryName}
              </address>
            </div>
            <div>
              <p className="eyebrow mb-4 text-ink/60">Direkte</p>
              <p className="text-lg text-ink/85">
                <a href={`mailto:${site.email}`} className="uline">
                  {site.email}
                </a>
                <br />
                <a href={site.phoneHref} className="uline">
                  {site.phone}
                </a>
              </p>
            </div>
            <div>
              <p className="eyebrow mb-4 text-ink/60">Åpningstider</p>
              <p className="text-ink/80">
                Man – fre · 07 – 16
                <br />
                Lør – søn · Etter avtale
              </p>
            </div>
            <div>
              <p className="eyebrow mb-4 text-ink/60">Organisasjonsnummer</p>
              <p className="text-ink/80">
                Org. nr. {site.orgNumber}
                <br />
                MVA-registrert
              </p>
            </div>
          </div>

          <div className="md:col-span-8">
            <ContactForm prefillRole={prefillRole} />
          </div>
        </div>
      </section>
    </>
  );
}
