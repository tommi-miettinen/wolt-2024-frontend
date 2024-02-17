import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar";
import { TranslationKeys } from "./i18n";
import Calculator from "./components/Calculator";

const Hero = () => (
  <div className="w-full h-full fixed inset-0 z-[-2] swap-bg bg-[size:70%] min-[1921px]:bg-[size:120%] bg-[position:800px] bg-no-repeat" />
);

const App = () => {
  const { t } = useTranslation();
  return (
    <div className="w-screen h-screen flex flex-col overflow-auto">
      <Navbar />
      <Hero />
      <main tabIndex={-1} className="w-full h-full sm:h-min m-auto sm:w-[550px] flex flex-col gap-4 focus:outline-none">
        <h1 className="hidden sm:block font-omnes-bold !text-black text-3xl sm:text-4xl">
          {t(TranslationKeys.CALCULATE_COST_OF_DELIVERY)}
        </h1>
        <div className="bg-body h-full w-full flex-grow p-4 sm:p-8 flex flex-col gap-4 sm:rounded-xl">
          <h2 className="block sm:hidden font-semibold text-primary text-2xl">{t(TranslationKeys.CALCULATE_COST_OF_DELIVERY)}</h2>
          <Calculator />
        </div>
      </main>
    </div>
  );
};

export default App;
