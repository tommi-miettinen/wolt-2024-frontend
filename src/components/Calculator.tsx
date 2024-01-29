import { Fragment, HTMLAttributes, useEffect, useState } from "react";
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
        <Fragment>
          <span>{t(TranslationKeys.COST_OF_DELIVERY)} </span>
          <span data-test-id="fee" className="font-semibold">
            {deliveryFee.toFixed(2)}€
          </span>
        </Fragment>
      ) : (
        <span>{t(TranslationKeys.COST_OF_DELIVERY_INCOMPLETE_INPUT)}</span>
      )}
    </div>
  );
};

const Calculator = () => {
  const [orderTime, setorderTime] = useState(new Date().toISOString().slice(0, 16));
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  const [distance, setDistance] = useState(0);
  const [numberOfItems, setnumberOfItems] = useState(0);
  const [isValidInput, setIsValidInput] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const handleDeliveryFee = () => {
      try {
        const fee = getDeliveryFee({ distance, cartValue, numberOfItems, orderTime: new Date(orderTime) });
        setDeliveryFee(fee);
        setIsValidInput(true);
      } catch {
        setDeliveryFee(0);
        setIsValidInput(false);
      }
    };
    handleDeliveryFee();
  }, [cartValue, distance, numberOfItems, orderTime]);

  return (
    <div tabIndex={-1} data-test-id="calculator" className="flex flex-col gap-4 text-primary">
      <div>
        <label className="py-1 block" htmlFor="cartValue">
          {t("cartValue")}
        </label>
        <NumberInput
          id="cartValue"
          data-test-id="cartValue"
          placeholder={t(TranslationKeys.CART_VALUE_PLACEHOLDER)}
          decimalPlaces={2}
          minValue={1}
          maxValue={100000}
          onChange={(value) => setCartValue(value)}
        />
      </div>
      <div>
        <label className="py-1 block" htmlFor="numberOfItems">
          {t(TranslationKeys.NUMBER_OF_ITEMS)}
        </label>
        <NumberInput
          id="numberOfItems"
          minValue={1}
          maxValue={100000}
          placeholder={t(TranslationKeys.NUMBER_OF_ITEMS_PLACEHOLDER)}
          data-test-id="numberOfItems"
          onChange={(value) => setnumberOfItems(value)}
        />
      </div>
      <div>
        <label className="py-1 block" htmlFor="deliveryDistance">
          {t(TranslationKeys.DELIVERY_DISTANCE)}
        </label>
        <NumberInput
          id="deliveryDistance"
          placeholder={t(TranslationKeys.DELIVERY_DISTANCE_PLACEHOLDER)}
          data-test-id="deliveryDistance"
          minValue={1}
          maxValue={1000000}
          onChange={(value) => setDistance(value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="py-1" htmlFor="orderTime">
          {t(TranslationKeys.ORDER_DATE)}
        </label>
        <input
          data-test-id="orderTime"
          id="orderTime"
          value={orderTime}
          onChange={(e) => setorderTime(e.target.value)}
          type="datetime-local"
        />
      </div>
      <FeeDisplay aria-live="polite" className="mt-4" isValidInput={isValidInput} deliveryFee={deliveryFee} />
    </div>
  );
};

export default Calculator;
