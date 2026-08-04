import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        bone: "#f4f1ec",
        stone: "#c9c4bc",
        char: "#1a1a1a",
        moss: "#3a3e35",
        rust: "#8a4a2f",
        fog: "#7a7876"
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
        swoop: "cubic-bezier(0.7, 0, 0.2, 1)"
      }
    }
  },
  plugins: []
};

export default config;
