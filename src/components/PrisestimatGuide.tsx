/**
 * Kort bruksanvisning for prisestimatet, øverst på /prisestimat.
 *
 * Tre steg som matcher de nummererte stegene i verktøyet under, pluss
 * en sammenfoldet «Flere tips» for den som vil vite mer. Ren HTML
 * (<details>) — ingen JavaScript, og den fungerer før siden er hydrert.
 */
const STEPS = [
  {
    title: "Skriv hva som skal gjøres",
    body: "For eksempel «terrasse», «ny kledning» eller «bytte vindu». Vi finner riktig post automatisk — du ser den rett under feltet. Fyll inn mengden, så regner vi ut arbeidet."
  },
  {
    title: "Velg materialer og se prisen",
    body: "Se prisen for kun arbeid, eller arbeid med standard- eller premiummaterialer. Prisen oppdateres mens du skriver."
  },
  {
    title: "Last ned eller be om befaring",
    body: "Last ned estimatet som PDF, eller send det til oss og be om en gratis, uforpliktende befaring."
  }
];

const TIPS = [
  "Én jobb per linje. Skal du både rive gammel og bygge ny terrasse, legg inn to linjer med «+ Ny post».",
  "Usikker på hva du skal skrive? Trykk «Bla i prisliste» og velg fra lista.",
  "Mengde: m² for flater (lengde × bredde), lm for løpemeter og stk for antall. Enheten foreslås automatisk. Et godt anslag holder — prisen vises som et spenn.",
  "Noen jobber har ekstra valg, som tilkomst eller type fundament. Velg det som passer best. Er du usikker, la standardvalget stå.",
  "Noen jobber kan bare prises etter befaring. De står under «Etter befaring» i prislista.",
  "Navn og e-post trenger vi først når du vil laste ned estimatet. Når du laster ned, får vi også en kopi, slik at vi kan følge opp.",
  "Totalprisen vises inkl. mva; prisen per linje er uten mva. Estimatet er veiledende og ikke et bindende tilbud — endelig pris får du i et skriftlig tilbud etter befaring."
];

export default function PrisestimatGuide() {
  return (
    <section
      aria-labelledby="veiledning-tittel"
      className="mx-auto max-w-[var(--page-max)] px-6 pb-24 md:px-10 md:pb-32"
    >
      <h2 id="veiledning-tittel" className="eyebrow mb-8 text-ink/60">
        Slik fungerer det
      </h2>

      <ol className="grid gap-8 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, i) => (
          <li key={step.title} className="border-t border-ink/20 pt-5 md:pt-6">
            <a href={`#steg-${i + 1}`} className="group block">
              <span className="eyebrow text-ink/50">Steg {i + 1}</span>
              <span className="headline mt-2 block text-[1.6rem] leading-tight md:mt-3 md:text-3xl">
                {step.title}
              </span>
            </a>
            <p className="mt-3 text-ink/75">{step.body}</p>
          </li>
        ))}
      </ol>

      <details className="group mt-10 border border-ink/15">
        <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 eyebrow text-ink/70 [&::-webkit-details-marker]:hidden">
          Flere tips
          <span
            aria-hidden
            className="text-lg leading-none transition-transform duration-300 ease-swoop group-open:rotate-45 motion-reduce:transition-none"
          >
            +
          </span>
        </summary>
        <ul className="list-disc space-y-3 border-t border-ink/10 py-6 pl-10 pr-6 text-ink/75 md:pl-11">
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </details>

      <a
        href="#steg-1"
        className="group mt-10 inline-flex min-h-[48px] items-center gap-3 border border-ink bg-ink px-7 py-4 eyebrow text-bone press hover:bg-transparent hover:text-ink"
      >
        Start beregningen
        <span aria-hidden className="transition-transform duration-500 ease-swoop group-hover:translate-y-0.5 motion-reduce:transition-none">
          ↓
        </span>
      </a>
    </section>
  );
}
