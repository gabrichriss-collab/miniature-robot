import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Send en forespørsel til Tømrer Kawiche — vi svarer innen én virkedag og kommer gjerne på befaring i Bergen, Nordhordland og omegn."
};

export default function KontaktPage({
  searchParams
}: {
  searchParams?: {
    rolle?: string;
    tjeneste?: string;
    prosjekt?: string;
    type?: string;
    melding?: string;
  };
}) {
  const prefillRole = searchParams?.rolle;
  const prefillProjectType = searchParams?.tjeneste;
  const prefillMessage =
    searchParams?.melding ??
    (searchParams?.prosjekt
      ? `Inspirert av prosjektet «${searchParams.prosjekt}». `
      : undefined);
  const isTilbud = searchParams?.type === "tilbud";
  return (
    <>
      <PageHeader
        kicker="Kontakt"
        title={isTilbud ? "Be om tilbud." : "Start en forespørsel."}
        lede={
          isTilbud
            ? "Fortell oss om prosjektet, så tar vi kontakt for befaring og skriftlig tilbud. Vanligvis innen én virkedag."
            : "En kort beskrivelse holder for å komme i gang. Vi tar kontakt for befaring — helt uforpliktende."
        }
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4 space-y-10">
            <div>
              <p className="eyebrow mb-4 text-ink/60">Vi jobber i</p>
              <p className="text-lg text-ink/85">
                Bergen, Nordhordland og omegn.
              </p>
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
            <ContactForm
              prefillRole={prefillRole}
              prefillProjectType={prefillProjectType}
              prefillMessage={prefillMessage}
            />
          </div>
        </div>
      </section>
    </>
  );
}
