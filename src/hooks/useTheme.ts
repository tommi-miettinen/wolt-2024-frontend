import { useState, useEffect } from "react";

enum Themes {
  LIGHT = "light",
  DARK = "dark",
}

const getStoredTheme = () => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    return storedTheme as Themes;
  }
  return getPreferredTheme();
};

const getPreferredTheme = () => {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return Themes.DARK;
  } else {
    return Themes.LIGHT;
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Themes>(getStoredTheme());

  const toggleTheme = () => {
    const newTheme = theme === Themes.LIGHT ? Themes.DARK : Themes.LIGHT;
    localStorage.theme = newTheme;
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    const storedTheme = getStoredTheme();
    document.documentElement.setAttribute("data-theme", storedTheme);
    setTheme(storedTheme);
  }, []);

  return { theme, toggleTheme };
};
