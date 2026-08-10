import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PrisestimatBuilder from "@/components/PrisestimatBuilder";

export const metadata: Metadata = {
  title: "Prisestimat",
  description:
    "Bygg ditt eget prisestimat linje for linje. Priser er veiledende — endelig tilbud gis skriftlig etter befaring."
};

export default function PrisestimatPage() {
  return (
    <>
      <PageHeader
        kicker="Prisestimat"
        title="Beregn selv."
        lede="Skriv hva som skal gjøres — bordkledning, terrasse, nytt vindu — så foreslår vi enhet og pris fra prislista vår. Summen oppdaterer seg mens du skriver, og du kan laste ned hele estimatet som PDF når du er ferdig."
      />
      <PrisestimatBuilder />
    </>
  );
}
