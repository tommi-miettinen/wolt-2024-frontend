import colors, { sky } from "tailwindcss/colors";
import { createThemes } from "tw-colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "omnes-bold": ["Omnes bold", "sans"],
      },
    },
  },
  plugins: [
    createThemes({
      light: {
        body: colors.white,
        primary: colors.black,
        "text-primary": colors.black,
        "text-primary-inverse": colors.white,
        "outline-color": colors.sky[500],
        borderColor: colors.gray[300],
      },
      dark: {
        body: colors.black,
        primary: colors.white,
        "text-primary": colors.white,
        "text-primary-inverse": colors.black,
        "outline-color": colors.sky,
        borderColor: colors.gray[600],
      },
    }),
  ],
};
