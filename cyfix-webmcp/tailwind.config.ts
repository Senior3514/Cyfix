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
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
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
