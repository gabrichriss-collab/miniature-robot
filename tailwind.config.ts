import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        bone: "#e7e5df",
        stone: "#c9c4bc",
        char: "#1a1a1a",
        moss: "#3a3e35",
        rust: "#8a4a2f",
        // Bunntekstens flate. Var #7a7570, som ga 2,46:1 for de minste
        // etikettene (text-bone/65) og 3,26:1 for lenketeksten — under
        // WCAG AA paa 4,5:1. Fargen var ikke til aa redde med opasitet:
        // selv 100 % bone naadde bare 3,67:1 mot den gamle verdien.
        // #3c3833 er den varme graatonen moerknet til alle nivaaene
        // klarer AA med margin (svakeste er bone/65 paa 4,91:1), og den
        // er fortsatt tydelig lysere enn ink saa bunnteksten beholder
        // sitt eget plan. Brukes kun her.
        fog: "#3c3833"
      },
      fontFamily: {
        display: ["var(--font-display)", "Sorts Mill Goudy", "Cormorant Garamond", "Georgia", "serif"],
        body: ["var(--font-body)", "Penumbra Std", "Cormorant Garamond", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      letterSpacing: {
        tightest: "-0.04em",
        wider2: "0.18em",
        widest2: "0.32em"
      },
      transitionTimingFunction: {
        swoop: "cubic-bezier(0.7, 0, 0.2, 1)",
        // Symmetrisk inn/ut for menysekvensen. swoop er vektet mot
        // slutten og foeles rask i avgangen; denne gir langsom avgang,
        // jevn bevegelse og kontrollert ankomst — som kreves naar
        // bevegelsen varer 800 ms og faktisk skal ses.
        menu: "cubic-bezier(0.65, 0, 0.35, 1)"
      }
    }
  },
  plugins: []
};

export default config;
