import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PrisestimatBuilder from "@/components/PrisestimatBuilder";
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
        lede="Skriv hva som skal gjøres — terrasse, ny kledning, nytt vindu — så finner vi riktig post og beregner arbeidstiden. Velg om du vil se prisen for kun arbeid, eller arbeid med materialer. Hele estimatet kan lastes ned som PDF."
      />
      {/* Katalogen bygges paa serveren og er allerede vasket for
          priser, timeforbruk og oppskrifter. Klienten faar bare navn,
          enhet, kategori og soekeord. */}
      <PrisestimatBuilder catalogue={buildPublicCatalogue()} />
    </>
  );
}
