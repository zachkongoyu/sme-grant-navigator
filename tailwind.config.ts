import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
        },
        border: "var(--color-border)",
        accent: {
          DEFAULT: "var(--color-accent)",
          muted: "var(--color-accent-muted)",
          teal: "var(--color-accent-teal)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
        },
        status: {
          warning: "var(--color-status-warning)",
          danger: "var(--color-status-danger)",
          success: "var(--color-status-success)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        ambient: "0 18px 40px rgba(0, 0, 0, 0.35)",
        dramatic: "0 20px 60px rgba(0, 0, 0, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
