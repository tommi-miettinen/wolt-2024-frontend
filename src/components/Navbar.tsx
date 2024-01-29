import woltlogowhite from "../assets/images/woltlogowhite.svg";
import woltlogoblack from "../assets/images/woltlogoblack.svg";
import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";
import { TranslationKeys } from "../i18n";

const focusMainContent = () => document.querySelector("main")?.focus();

export const SkipLink = () => {
  const { t } = useTranslation();

  return (
    <button
      data-test-id="skipLink"
      onKeyDown={(e) => e.key === "Enter" && focusMainContent()}
      onClick={focusMainContent}
      className="absolute border-0 bg-white rounded-lg left-[-999px] top-2 z-50 text-black p-2 focus:left-2 focus:opacity-100 focus:outline focus:outline-sky-500"
    >
      {t(TranslationKeys.SKIP_TO_MAIN_CONTENT)}
    </button>
  );
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    i18n.language === "en" ? i18n.changeLanguage("fi") : i18n.changeLanguage("en");
    document.documentElement.lang = i18n.language;
  };

  const logo = theme === "light" ? woltlogoblack : woltlogowhite;

  return (
    <div data-test-id="navbar" className="bg-body border-b border-border-color p-3.5 w-full flex items-center justify-center">
      <div className="w-[1200px] flex items-center justify-between">
        <img src={logo} className="h-[32px] w-[80px]" alt="Wolt Logo" />
        <div className="flex gap-2">
          <button
            data-test-id="languageSwitch"
            aria-label={i18n.language === "en" ? "Switch to Finnish" : "Switch to English"}
            className={buttonStyle}
            onClick={changeLanguage}
          >
            {i18n.language === "en" ? "Suomeksi" : "In English"}
          </button>
          <div className=" flex items-center">
            <label data-test-id="themeSwitch" className="relative inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                onKeyDown={(e) => e.key === "Enter" && toggleTheme()}
                onChange={toggleTheme}
                className="sr-only peer"
                checked={theme === "dark"}
              />
              <div className={switchStyle} />
              <span className="text-primary font-medium">Tumma teema</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

const buttonStyle = `py-2 px-2 sm:px-5 text-primary border border-border-color
focus:outline focus:border-sky-500 focus:outline-sky-500
hover :duration-500 hover:shadow hover:text-sky-400 rounded-lg`;

const switchStyle = `w-11 h-6 bg-gray-200 rounded-full 
                     peer-checked:bg-blue-600
                     peer-focus:outline peer-focus:outline-sky-500
                     after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                     after:bg-white after:rounded-full after:w-5 after:h-5 
                     after:transition-all peer-checked:after:translate-x-full`;
