import { useState, useEffect } from "react";

enum Themes {
  LIGHT = "light",
  DARK = "dark",
}

const getPreferredTheme = () => {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return Themes.DARK;
  } else {
    return Themes.LIGHT;
  }
};

const getStoredThemeOrDefault = () => {
  const storedTheme = localStorage.theme as Themes;
  return storedTheme ? storedTheme : getPreferredTheme();
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Themes>(getStoredThemeOrDefault());

  const toggleTheme = () => {
    const newTheme = theme === Themes.LIGHT ? Themes.DARK : Themes.LIGHT;
    localStorage.theme = newTheme;
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    const storedTheme = getStoredThemeOrDefault();
    document.documentElement.setAttribute("data-theme", storedTheme);
    setTheme(storedTheme);
  }, []);

  return { theme, toggleTheme };
};
