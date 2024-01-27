import { useTranslation } from "react-i18next";
import Navbar, { SkipLink } from "./components/Navbar";
import { TranslationKeys } from "./i18n";
import Calculator from "./components/Calculator";
import woltbg from "./assets/woltbg.jpg";

const App = () => {
  const { t } = useTranslation();
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <div
        className="w-full bg-[#cbe1ad] fixed top-16 left-0 z-[-1]"
        style={{
          backgroundImage: `url(${woltbg})`,
          backgroundSize: "70%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundPositionX: "800px",

          height: "100%",
        }}
      />
      <SkipLink />
      <Navbar />
      <main tabIndex={-1} className="w-full h-full sm:h-min  m-auto sm:w-[550px] flex flex-col gap-4 bg-transparent focus:outline-none">
        <h1 className="hidden sm:block font-omnes-bold text-black text-3xl sm:text-4xl">{t(TranslationKeys.CALCULATE_COST_OF_DELIVERY)}</h1>
        <div className="bg-body h-full w-full p-4 sm:p-8 flex flex-col gap-4 sm:rounded-xl">
          <h1 className="block sm:hidden font-semibold text-black text-2xl">{t(TranslationKeys.CALCULATE_COST_OF_DELIVERY)}</h1>
          <Calculator />
        </div>
      </main>
    </div>
  );
};

export default App;
