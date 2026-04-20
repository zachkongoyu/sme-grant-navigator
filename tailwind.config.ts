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
        background: "#050507",
        surface: {
          DEFAULT: "#101010",
          elevated: "#171717",
        },
        border: "#3d3a39",
        accent: {
          DEFAULT: "#00d992",
          muted: "#2fd6a1",
          teal: "#4cb3d4",
        },
        text: {
          primary: "#f2f2f2",
          secondary: "#b8b3b0",
          tertiary: "#8b949e",
        },
        status: {
          warning: "#ffba00",
          danger: "#fb565b",
          success: "#008b00",
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
