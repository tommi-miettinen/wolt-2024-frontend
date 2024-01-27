import { useTranslation } from "react-i18next";
import Navbar, { SkipLink } from "./components/Navbar";
import { TranslationKeys } from "./i18n";
import Calculator from "./components/Calculator";

const App = () => {
  const { t } = useTranslation();
  return (
    <div className="text-base w-screen h-screen bg-body-accent flex flex-col items-center overflow-hidden">
      <SkipLink />
      <Navbar />
      <main data-testid="main" id="main" className="w-full sm:m-auto sm:w-[600px] p-1 flex flex-col gap-8">
        <h1 className="font-omnes-bold text-primary text-3xl sm:text-4xl">{t(TranslationKeys.CALCULATE_COST_OF_DELIVERY)}</h1>
        <div className="bg-body w-full p-4 py-8 sm:p-8 flex flex-col gap-4 rounded-xl shadow-xl">
          <Calculator />
        </div>
      </main>
    </div>
  );
};

export default App;
