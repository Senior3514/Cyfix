import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#0a0e12",
          900: "#0d1218",
          850: "#111820",
          800: "#141c26",
          700: "#1c2733",
          600: "#2a3947",
          500: "#425468",
        },
        teal: {
          950: "#042f2c",
          900: "#0a4c46",
          700: "#0f766e",
          600: "#0d9488",
          500: "#14b8a6",
          400: "#2dd4bf",
          300: "#5eead4",
        },
        severity: {
          critical: "#f43f5e",
          high: "#fb923c",
          medium: "#facc15",
          low: "#38bdf8",
          info: "#94a3b8",
        },
      },
      fontFamily: {
        // Inter for reading, Space Grotesk for anything that should feel built
        // rather than written, JetBrains Mono for tool names and code.
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        "scan-sweep": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "12%": { opacity: "1" },
          "88%": { opacity: "1" },
          "100%": { transform: "translateY(1100%)", opacity: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.55" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        "dash-flow": { to: { strokeDashoffset: "-24" } },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "scan-sweep": "scan-sweep 2.6s cubic-bezier(0.4,0,0.6,1) infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0,0,0.2,1) infinite",
        "dash-flow": "dash-flow 1s linear infinite",
        float: "float 5s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(45,212,191,0.15), 0 0 24px rgba(20,184,166,0.15)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(45,212,191,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
