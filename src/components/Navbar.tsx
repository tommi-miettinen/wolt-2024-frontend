import woltlogowhite from "../assets/woltlogowhite.svg";
import woltlogoblack from "../assets/woltlogoblack.svg";
import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";
import { TranslationKeys } from "../i18n";

const focusMainContent = () => document.querySelector("main")?.focus();

export const SkipLink = () => {
  const { t } = useTranslation();

  return (
    <a
      tabIndex={0}
      data-test-id="skipLink"
      onKeyDown={(e) => e.key === "Enter" && focusMainContent()}
      onClick={focusMainContent}
      className="absolute left-[-999px] top-0 z-50 bg-white text-black p-2 focus:left-0 focus:opacity-100 focus:border-2 focus:border-sky-500"
    >
      {t(TranslationKeys.SKIP_TO_MAIN_CONTENT)}
    </a>
  );
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  const changeLanguage = () => (i18n.language === "en" ? i18n.changeLanguage("fi") : i18n.changeLanguage("en"));
  const logo = theme === "light" ? woltlogoblack : woltlogowhite;

  return (
    <div className="bg-body border-b  border-border-color p-3.5 w-full flex items-center justify-center">
      <div className="w-[1200px] flex items-center justify-between">
        <img src={logo} className="h-[32px] w-[120px]" alt="Wolt Logo" />
        <div className="flex gap-2">
          <button
            aria-label={i18n.language === "en" ? "Switch to Finnish" : "Switch to English"}
            className="py-2 px-2 sm:px-5 text-primary border border-border-color sm:duration-500 hover:shadow hover:text-sky-400 rounded-lg"
            onClick={changeLanguage}
          >
            {i18n.language === "en" ? "Suomeksi" : "In English"}
          </button>
          <button
            aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            className="py-2 px-2 sm:px-5 text-primary border border-border-color sm:duration-500 hover:shadow hover:text-sky-400 rounded-lg"
            onClick={toggleTheme}
          >
            {theme === "light" ? "Dark" : "Light"} theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
