import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        muted: "var(--bg-muted)",
        ink: "var(--text-primary)",
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
          teal: "var(--accent-secondary)",
        },
      },
      textColor: {
        ink: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        subtle: "var(--text-muted)",
        surface: "var(--bg-surface)",
        accent: {
          DEFAULT: "var(--accent-text)",
          teal: "var(--accent-secondary)",
        },
      },
      borderColor: {
        hairline: "var(--border-default)",
        ink: "var(--text-primary)",
        accent: "var(--accent-text)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Hind Siliguri", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
