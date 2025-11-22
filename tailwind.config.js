import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6fe",
          200: "#b0ccfd",
          300: "#88b1fb",
          400: "#5f97fa",
          500: "#377df8",
          600: "#1a61db",
          700: "#1249a7",
          800: "#0b316f",
          900: "#051a38",
        },
      },
      boxShadow: {
        glow: "0 20px 50px -30px rgba(53, 121, 235, 0.60)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(15,23,42,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.15) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
