import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Ta kontakt med Tømrer Kawiche — vi svarer innen én virkedag."
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
        lede="En kort e-post eller en telefon er alt som skal til. Vi kommer gjerne på befaring — det koster ingenting og forplikter til ingenting."
      />

      <section className="mx-auto max-w-[var(--page-max)] px-6 pb-28 md:px-10 md:pb-40">
        <div className="rule mb-16" />
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4 space-y-10">
            <div>
              <p className="eyebrow mb-4 text-ink/60">Verksted</p>
              <address className="not-italic text-lg text-ink/85">
                Tømrerveien 12
                <br />
                0000 Oslo, Norge
              </address>
            </div>
            <div>
              <p className="eyebrow mb-4 text-ink/60">Direkte</p>
              <p className="text-lg text-ink/85">
                <a href="mailto:post@tomrerkawiche.no" className="uline">
                  post@tomrerkawiche.no
                </a>
                <br />
                <a href="tel:+4790000000" className="uline">
                  +47 900 00 000
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
          </div>

          <div className="md:col-span-8">
            <ContactForm prefillRole={prefillRole} />
          </div>
        </div>
      </section>
    </>
  );
}
