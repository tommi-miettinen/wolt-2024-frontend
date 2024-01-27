import { useEffect, useState } from "react";
import { calcDeliveryFee, isRushHour } from "../services/feeCalculationService";
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
    if (!distance || !cartValue || !itemCount || !datetime) return;

    const fee = calcDeliveryFee({
      distance,
      cartValue,
      itemCount,
      isRushHour: isRushHour(datetime),
    });

    setDeliveryFee(fee);
  }, [cartValue, distance, itemCount, datetime]);

  return (
    <div tabIndex={-1} data-testid="calculator" className="flex flex-col gap-4 text-primary">
      <div className="flex flex-col gap-1">
        <label htmlFor="cart-value">{t("cartValue")}</label>
        <NumberInput
          id="cart-value"
          data-testid="cartValue"
          className="border bg-transparent p-2 rounded-lg"
          value={cartValue}
          onChange={(value) => setCartValue(value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="item-count">{t(TranslationKeys.NUMBER_OF_ITEMS)}</label>
        <NumberInput
          id="item-count"
          data-testid="numberOfItems"
          className="border bg-transparent p-2 rounded-lg"
          value={itemCount}
          onChange={(value) => setItemCount(value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="distance">{t(TranslationKeys.DELIVERY_DISTANCE)}</label>
        <NumberInput
          id="distance"
          data-testid="deliveryDistance"
          className="border bg-transparent p-2 rounded-lg"
          value={distance}
          onChange={(value) => setDistance(value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="date">{t(TranslationKeys.ORDER_DATE)}</label>
        <input
          className="border bg-transparent w-min  p-2 px-4 rounded-lg"
          id="date"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          type="datetime-local"
        />
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
