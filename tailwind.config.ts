import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        river: "#147C9C",
        surge: "#E4572E",
        split: "#1F8A70",
        mile: "#C88A16",
        paper: "#F7F8FA",
      },
      boxShadow: {
        soft: "0 14px 40px rgba(23, 32, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
