import { useState } from "react";
import woltlogowhite from "../assets/woltlogowhite.svg";
import woltlogoblack from "../assets/woltlogoblack.svg";
import { useTranslation } from "react-i18next";

export const SkipLink = () => {
  return (
    <a data-testid="skipLink" href="#main" className="sr-only focus:not-sr-only">
      Skip to main content
    </a>
  );
};

const Navbar = () => {
  const [currentTheme, setCurrentTheme] = useState<string>(document.documentElement.getAttribute("data-theme") || "");
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    if (i18n.language === "en") {
      i18n.changeLanguage("fi");
    } else {
      i18n.changeLanguage("en");
    }
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "light") {
      document.documentElement.setAttribute("data-theme", "dark");
      setCurrentTheme("dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      setCurrentTheme("light");
    }
  };

  const logo = currentTheme === "light" ? woltlogoblack : woltlogowhite;

  return (
    <div className="bg-body p-4 h-[80px] w-full flex items-center justify-center">
      <div className="w-[1200px] flex items-center justify-between">
        <img src={logo} className="h-[36px] w-[120px]" alt="Wolt Logo" />
        <div className="flex gap-2">
          <button className="py-2 px-5 text-primary border rounded-lg" onClick={changeLanguage}>
            {i18n.language === "en" ? "Suomeksi" : "In English"}
          </button>
          <button className="py-2 px-5 text-primary border rounded-lg" onClick={toggleTheme}>
            {currentTheme === "light" ? "Dark" : "Light"} theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
