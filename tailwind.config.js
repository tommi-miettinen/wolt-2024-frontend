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
        textPrimaryColor: colors.black,
        textPrimaryColorInverse: colors.white,
        borderColor: colors.gray[300],
      },
      dark: {
        body: colors.black,
        primary: colors.white,
        textPrimaryColor: colors.white,
        textPrimaryColorInverse: colors.black,
        borderColor: colors.gray[600],
      },
    }),
  ],
};
