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
        orange: {
          DEFAULT: "#de783c",
          50: "#fef6f0",
          100: "#fceadc",
          200: "#f9d3b8",
          300: "#f5b48a",
          400: "#ef8c55",
          500: "#de783c",
          600: "#c95e2a",
          700: "#a74924",
          800: "#863c24",
          900: "#6d3421",
        },
        magenta: {
          DEFAULT: "#e900bd",
          50: "#fdf2fb",
          100: "#fce7f9",
          200: "#facef3",
          300: "#f7a7e9",
          400: "#f171d8",
          500: "#e900bd",
          600: "#cd1ca0",
          700: "#a91380",
          800: "#8a1369",
          900: "#721558",
        },
        rose: {
          light: "#dec3d7",
          50: "#fbf7fa",
          100: "#f7eff5",
          200: "#efdded",
          300: "#dec3d7",
          400: "#c99ebf",
          500: "#b37ca5",
          600: "#996289",
          700: "#7f4e70",
          800: "#6a435d",
          900: "#5a3a4f",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.05)",
        medium: "0 8px 30px rgba(0, 0, 0, 0.08)",
        glow: "0 0 40px rgba(233, 0, 189, 0.15)",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #e900bd 0%, #de783c 55%, #dec3d7 100%)",
        "gradient-soft":
          "radial-gradient(circle at top left, rgba(233,0,189,0.10), transparent 55%), radial-gradient(circle at bottom right, rgba(222,120,60,0.10), transparent 55%)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

