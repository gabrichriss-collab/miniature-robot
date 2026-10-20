import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PrisestimatBuilder from "@/components/PrisestimatBuilder";
import PrisestimatGuide from "@/components/PrisestimatGuide";
import { buildPublicCatalogue } from "@/server/pricing/catalogue";

export const metadata: Metadata = {
  title: "Prisestimat",
  description:
    "Beregn arbeid og materialer for prosjektet ditt. Estimatet er veiledende — endelig pris fastsettes i et skriftlig tilbud."
};

export default function PrisestimatPage() {
  return (
    <>
      <PageHeader
        kicker="Prisestimat"
        title="Beregn selv."
        lede="Få et veiledende prisestimat på et par minutter — gratis og uforpliktende. Tre enkle steg."
      />
      <PrisestimatGuide />
      {/* Katalogen bygges paa serveren og er allerede vasket for
          priser, timeforbruk og oppskrifter. Klienten faar bare navn,
          enhet, kategori og soekeord. */}
      <PrisestimatBuilder catalogue={buildPublicCatalogue()} />
    </>
  );
}
