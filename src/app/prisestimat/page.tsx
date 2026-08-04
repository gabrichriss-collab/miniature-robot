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
        lede="Skriv hva som skal gjøres — bordkledning, terrasse, nytt vindu — så foreslår systemet enhet og pris fra vår prisliste. Estimatet oppdateres i sanntid, og du kan laste det ned som PDF når du er ferdig."
      />
      <PrisestimatBuilder />
    </>
  );
}
