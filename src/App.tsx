import { useTranslation } from "react-i18next";
import Navbar, { SkipLink } from "./components/Navbar";
import { TranslationKeys } from "./i18n";
import Calculator from "./components/Calculator";

const Hero = () => {
  return (
    <div
      className="w-full bg-[#f0ecf4] fixed top-16 left-0 z-[-2] swap-bg"
      style={{
        backgroundSize: "70%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundPositionX: "800px",
        height: "100%",
      }}
    />
  );
};

const App = () => {
  const { t } = useTranslation();
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <Hero />
      <SkipLink />
      <Navbar />
      <main tabIndex={-1} className=" w-full h-full sm:h-min m-auto sm:w-[550px] flex flex-col gap-4 bg-transparent focus:outline-none">
        <h1 className="hidden sm:block font-omnes-bold !text-black text-3xl sm:text-4xl">
          {t(TranslationKeys.CALCULATE_COST_OF_DELIVERY)}
        </h1>
        <div className="bg-body h-full w-full p-4 sm:p-8 flex flex-col gap-4 sm:rounded-xl">
          <h2 className="block sm:hidden font-semibold text-primary text-2xl">{t(TranslationKeys.CALCULATE_COST_OF_DELIVERY)}</h2>
          <Calculator />
        </div>
      </main>
    </div>
  );
};

export default App;
