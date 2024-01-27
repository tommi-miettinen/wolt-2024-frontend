import colors from "tailwindcss/colors";
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
        "body-accent": colors.purple[50],
        "body-1": colors.purple[100],
        primary: colors.black,
        text: colors.black,
        "text-inverse": colors.white,
      },

      dark: {
        body: colors.black,
        "body-accent": "#1E1E1E",
        "body-1": "#1E1E1E",
        primary: colors.white,
        text: colors.white,
        "text-inverse": colors.black,
      },
    }),
  ],
};
