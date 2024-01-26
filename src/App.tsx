import { useEffect, useState } from "react";
import { calculateDeliveryFee, isRushHour } from "./services/feeCalculationService";
import NumberInput from "./components/NumberInput";
import woltlogo from "./assets/woltlogo.svg";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { i18n } = useTranslation();

  const changeLanguage = () => {
    if (i18n.language === "en") {
      i18n.changeLanguage("fi");
    } else {
      i18n.changeLanguage("en");
    }
  };
  return (
    <div className="bg-white p-4 h-[80px] w-full flex items-center justify-center">
      <div className="w-[1200px] flex items-center justify-between">
        <img src={woltlogo} className="h-[36px] w-[120px]" alt="Wolt Logo" />
        <button onClick={changeLanguage}>click</button>
      </div>
    </div>
  );
};

const SkipLink = () => {
  return (
    <a href="#main" className="sr-only focus:not-sr-only">
      Skip to main content
    </a>
  );
};

enum Keys {
  CART_VALUE = "cartValue",
  NUMBER_OF_ITEMS = "numberOfItems",
  DELIVERY_DISTANCE = "deliveryDistance",
  ORDER_DATE = "orderDate",
  COST_OF_DELIVERY = "costOfDelivery",
  CALCULATE_COST_OF_DELIVERY = "calculateCostOfDelivery",
}

const App = () => {
  //In production id use date-fns / momentjs / Temporal and a Datepicker UI component
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 16));
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  const [distance, setDistance] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const { t } = useTranslation();

  useEffect(() => {
    if (!distance || !cartValue || !itemCount || !datetime) return;

    const fee = calculateDeliveryFee(distance, cartValue, itemCount, isRushHour(datetime));
    setDeliveryFee(fee);
  }, [cartValue, distance, itemCount, datetime]);

  return (
    <div className="text-base w-screen h-screen bg-purple-50 flex flex-col items-center overflow-hidden">
      <SkipLink />
      <Navbar />
      <main id="main" className="w-full sm:m-auto sm:w-[600px] p-1 flex flex-col gap-8">
        <h1 className="font-omnes-bold text-3xl sm:text-4xl">{t(Keys.CALCULATE_COST_OF_DELIVERY)}</h1>
        <div className="font-semibold w-full p-4 py-8 sm:p-8 flex flex-col gap-4 rounded-xl bg-white shadow-xl">
          <div className="flex flex-col gap-1">
            <label htmlFor="cart-value">{t("cartValue")}</label>
            <NumberInput
              id="cart-value"
              data-testid="cartValue"
              className="border-black border-2 p-2 rounded-lg"
              value={cartValue}
              onChange={(value) => setCartValue(value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="item-count">{t(Keys.NUMBER_OF_ITEMS)}</label>
            <NumberInput
              id="item-count"
              data-testid="numberOfItems"
              className="border-black border-2 p-2 rounded-lg"
              value={itemCount}
              onChange={(value) => setItemCount(value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="distance">{t(Keys.DELIVERY_DISTANCE)}</label>
            <NumberInput
              id="distance"
              data-testid="deliveryDistance"
              className="border-black  border-2 p-2 rounded-lg"
              value={distance}
              onChange={(value) => setDistance(value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="date">{t(Keys.ORDER_DATE)}</label>
            <input
              className="border-black w-min border-2 p-2 px-4 rounded-lg"
              id="date"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              type="datetime-local"
            />
          </div>
          <div aria-live="polite" className="mt-4">
            <span>{t(Keys.COST_OF_DELIVERY)} </span>
            <span data-testid="fee" className="font-semibold">
              {deliveryFee.toFixed(2)}€
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
