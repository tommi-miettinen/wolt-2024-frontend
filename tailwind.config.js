import colors from "tailwindcss/colors";
import { createThemes } from "tw-colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "hero-image": "url('/src/woltbg.jpg')",
      },
      fontFamily: {
        "omnes-bold": ["Omnes bold", "sans"],
      },
    },
  },
  plugins: [
    createThemes({
      light: {
        body: colors.white,
        "body-accent": colors.purple[50],
        "body-1": colors.purple[100],
        primary: colors.black,
        "text-primary": colors.black,
        "text-primary-inverse": colors.white,
        "border-color": colors.gray[300],
      },
      dark: {
        body: colors.black,
        "body-accent": colors.gray[950],
        "body-1": "#1E1E1E",
        primary: colors.white,
        "text-primary": colors.white,
        "text-primary-inverse": colors.black,
        "border-color": colors.gray[700],
      },
    }),
  ],
};
