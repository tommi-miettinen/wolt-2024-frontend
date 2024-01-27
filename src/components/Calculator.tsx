import { useEffect, useState } from "react";
import { getDeliveryFee, isRushHour, validateDeliveryFeeInput } from "../services/feeCalculationService";
import NumberInput from "./NumberInput";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n";

const Calculator = () => {
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 16));
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  const [distance, setDistance] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const { t } = useTranslation();

  useEffect(() => {
    handleDeliveryFeeChange();
  }, [cartValue, distance, itemCount, datetime]);

  const handleDeliveryFeeChange = () => {
    const { success } = validateDeliveryFeeInput({ cartValue, distance, itemCount });
    if (!success) return setDeliveryFee(0);

    const fee = getDeliveryFee({
      distance,
      cartValue,
      itemCount,
      isRushHour: isRushHour(datetime),
    });

    setDeliveryFee(fee);
  };

  return (
    <div tabIndex={-1} data-testid="calculator" className="flex flex-col gap-4 text-primary">
      <div className="flex flex-col">
        <label className="cursor-pointer py-1" htmlFor="cart-value">
          {t("cartValue")}
        </label>
        <NumberInput
          id="cart-value"
          data-testid="cartValue"
          placeholder="How much do your items cost?"
          className={inputStyle}
          value={cartValue}
          onChange={(value) => setCartValue(value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="cursor-pointer py-1" htmlFor="item-count">
          {t(TranslationKeys.NUMBER_OF_ITEMS)}
        </label>
        <NumberInput
          id="item-count"
          isInteger
          placeholder="How many items you have in your cart?"
          data-testid="numberOfItems"
          className={inputStyle}
          value={itemCount}
          onChange={(value) => setItemCount(value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="cursor-pointer  py-1" htmlFor="distance">
          {t(TranslationKeys.DELIVERY_DISTANCE)}
        </label>
        <NumberInput
          id="distance"
          placeholder="How far are you from the restaurant?"
          isInteger
          data-testid="deliveryDistance"
          className={inputStyle}
          value={distance}
          onChange={(value) => setDistance(value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="cursor-pointer py-1" htmlFor="date">
          {t(TranslationKeys.ORDER_DATE)}
        </label>
        <input className={inputStyle} id="date" value={datetime} onChange={(e) => setDatetime(e.target.value)} type="datetime-local" />
      </div>
      <div aria-live="polite" className="mt-4">
        <span>{t(TranslationKeys.COST_OF_DELIVERY)} </span>
        <span data-testid="fee" className="font-semibold">
          {deliveryFee.toFixed(2)}€
        </span>
      </div>
    </div>
  );
};

export default Calculator;

const inputStyle = `
border border-border-color 
focus:outline focus:border-sky-500 focus:outline-sky-500 
bg-transparent p-2 rounded-lg
hover:border-sky-300 hover:outline hover:outline-sky-300
`;
