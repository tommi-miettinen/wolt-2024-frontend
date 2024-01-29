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
};

const getPreferredTheme = () => {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return Themes.DARK;
  } else {
    return Themes.LIGHT;
  }
};

const getStoredThemeOrDefault = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  } else {
    return getPreferredTheme();
  }
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
