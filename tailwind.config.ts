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
        fog: "#7a7570"
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
