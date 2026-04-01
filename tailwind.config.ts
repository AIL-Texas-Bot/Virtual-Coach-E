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
        bg: {
          DEFAULT: "#0a0b0e",
          card: "#12141a",
          hover: "#181b23",
        },
        gold: {
          DEFAULT: "#c9a84c",
          dim: "#a68a3a",
        },
        success: "#3ecf8e",
        danger: "#ef4444",
        bio: "#60a5fa",
        text: {
          DEFAULT: "#e8e6e1",
          mid: "#a0a3b0",
          dim: "#7a7d89",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
