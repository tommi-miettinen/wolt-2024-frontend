import { useState, useEffect } from "react";

enum Themes {
  LIGHT = "light",
  DARK = "dark",
}

const getStoredTheme = () => (document.documentElement.getAttribute("data-theme") as Themes) || Themes.LIGHT;

export const useTheme = () => {
  const [theme, setTheme] = useState<Themes>(getStoredTheme());

  const toggleTheme = () => {
    const newTheme = theme === Themes.LIGHT ? Themes.DARK : Themes.LIGHT;
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
  }, []);

  return { theme, toggleTheme };
};
