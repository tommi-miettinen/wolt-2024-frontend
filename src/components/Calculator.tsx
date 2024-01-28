import { HTMLAttributes, useEffect, useState } from "react";
import { getDeliveryFee } from "../services/feeCalculationService/internal";
import NumberInput from "./NumberInput";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n";

interface FeeDisplayProps extends HTMLAttributes<HTMLDivElement> {
  deliveryFee: number;
  isValidInput: boolean;
}

const FeeDisplay = ({ deliveryFee, isValidInput, ...rest }: FeeDisplayProps) => {
  const { t } = useTranslation();
  return (
    <div {...rest}>
      {isValidInput ? (
        <>
          <span>{t(TranslationKeys.COST_OF_DELIVERY)} </span>
          <span data-testid="fee" className="font-semibold">
            {deliveryFee.toFixed(2)}€
          </span>
        </>
      ) : (
        <span>{t(TranslationKeys.COST_OF_DELIVERY_INCOMPLETE_INPUT)}</span>
      )}
    </div>
  );
};

const Calculator = () => {
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 16));
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  const [distance, setDistance] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isValidInput, setIsValidInput] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    handleDeliveryFee();
  }, [cartValue, distance, itemCount, datetime]);

  const handleDeliveryFee = () => {
    try {
      const fee = getDeliveryFee({ distance, cartValue, itemCount, date: new Date(datetime) });
      setDeliveryFee(fee);
      setIsValidInput(true);
    } catch {
      setDeliveryFee(0);
      setIsValidInput(false);
    }
  };

  return (
    <div tabIndex={-1} data-testid="calculator" className="flex flex-col gap-4 text-primary">
      <div className="flex flex-col">
        <label className="cursor-pointer py-1" htmlFor="cartValue">
          {t("cartValue")}
        </label>
        <NumberInput
          id="cartValue"
          data-testid="cartValue"
          placeholder={t(TranslationKeys.CART_VALUE_PLACEHOLDER)}
          minValue={0}
          maxValue={100000}
          className={inputStyle}
          value={cartValue}
          onChange={(value) => setCartValue(value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="cursor-pointer py-1" htmlFor="numberOfItems">
          {t(TranslationKeys.NUMBER_OF_ITEMS)}
        </label>
        <NumberInput
          id="numberOfItems"
          isInteger
          minValue={1}
          maxValue={100000}
          placeholder={t(TranslationKeys.NUMBER_OF_ITEMS_PLACEHOLDER)}
          data-testid="numberOfItems"
          className={inputStyle}
          value={itemCount}
          onChange={(value) => setItemCount(value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="cursor-pointer  py-1" htmlFor="deliveryDistance">
          {t(TranslationKeys.DELIVERY_DISTANCE)}
        </label>
        <NumberInput
          id="deliveryDistance"
          placeholder={t(TranslationKeys.DELIVERY_DISTANCE_PLACEHOLDER)}
          isInteger
          data-testid="deliveryDistance"
          minValue={1}
          maxValue={1000000}
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
      <FeeDisplay aria-live="polite" className="mt-4" isValidInput={isValidInput} deliveryFee={deliveryFee} />
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
