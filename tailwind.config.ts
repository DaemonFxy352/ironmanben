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
        // v2 Design System
        primary: "#ADFF45",        // lime green - primary action
        "primary-text": "#0D0D0D",  // near black
        background: "#F5F5F0",      // warm off-white
        card: "#FFFFFF",            // card background
        "accent-warm": "#FF6B2B",   // orange - Ben's stage badge
        danger: "#DC2626",          // red - Need Help only
        success: "#16A34A",         // green - confirmed check-ins
        muted: "#6B7280",           // gray - muted text (min 14px)
        border: "#E5E5E0",          // borders

        // Legacy colors (keep for now)
        ink: "#17202A",
        river: "#147C9C",
        surge: "#E4572E",
        split: "#1F8A70",
        mile: "#C88A16",
        paper: "#F7F8FA",
      },
      boxShadow: {
        soft: "0 14px 40px rgba(23, 32, 42, 0.08)",
        card: "0 1px 3px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
