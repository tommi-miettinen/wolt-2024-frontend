import { Fragment, HTMLAttributes, useEffect, useState } from "react";
import { getDeliveryFee } from "../services/feeCalculationService";
import NumberInput from "./NumberInput";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n";
import Tooltip from "./Tooltip";

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
          <output data-test-id="fee" name="resulting-fee" className="font-semibold">
            {deliveryFee.toFixed(2)}€
          </output>
        </Fragment>
      ) : (
        <span>{t(TranslationKeys.COST_OF_DELIVERY_INCOMPLETE_INPUT)}</span>
      )}
    </div>
  );
};

const InfoIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        clipRule="evenodd"
      />
    </svg>
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

  const scrollToView = (input: HTMLInputElement) => input.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div tabIndex={-1} data-test-id="calculator" className="flex flex-col gap-4 text-primary">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <label htmlFor="cartValue">{t(TranslationKeys.CART_VALUE)}</label>
          <Tooltip trigger={<InfoIcon />} content={t(TranslationKeys.CART_VALUE_INPUT_INFO)} />
        </div>
        <NumberInput
          id="cartValue"
          data-test-id="cartValue"
          placeholder={t(TranslationKeys.CART_VALUE_PLACEHOLDER)}
          decimalPlaces={2}
          onFocus={(e) => scrollToView(e.target)}
          minValue={1}
          maxValue={100000}
          onChange={(value) => setCartValue(value)}
        />
        <p id="helper-text-explanation" className="text-sm">
          {t(TranslationKeys.CART_VALUE_HELPER_TEXT)}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <label htmlFor="numberOfItems">{t(TranslationKeys.NUMBER_OF_ITEMS)}</label>
          <Tooltip trigger={<InfoIcon />} content={t(TranslationKeys.NUMBER_OF_ITEMS_INPUT_INFO)} />
        </div>
        <NumberInput
          id="numberOfItems"
          minValue={1}
          maxValue={100000}
          onFocus={(e) => scrollToView(e.target)}
          placeholder={t(TranslationKeys.NUMBER_OF_ITEMS_PLACEHOLDER)}
          data-test-id="numberOfItems"
          onChange={(value) => setnumberOfItems(value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <label htmlFor="deliveryDistance">
            <span>{t(TranslationKeys.DELIVERY_DISTANCE)}</span>
          </label>
          <Tooltip trigger={<InfoIcon />} content={t(TranslationKeys.DELIVERY_DISTANCE_INPUT_INFO)} />
        </div>
        <NumberInput
          id="deliveryDistance"
          placeholder={t(TranslationKeys.DELIVERY_DISTANCE_PLACEHOLDER)}
          data-test-id="deliveryDistance"
          minValue={1}
          onFocus={(e) => scrollToView(e.target)}
          maxValue={1000000}
          onChange={(value) => setDistance(value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <label htmlFor="orderTime">{t(TranslationKeys.ORDER_DATE)}</label>
          <Tooltip trigger={<InfoIcon />} content={t(TranslationKeys.ORDER_DATE_INPUT_INFO)} />
        </div>
        <input
          data-test-id="orderTime"
          id="orderTime"
          value={orderTime}
          onFocus={(e) => scrollToView(e.target)}
          onChange={(e) => setorderTime(e.target.value)}
          type="datetime-local"
        />
      </div>
      <FeeDisplay className="mt-4" isValidInput={isValidInput} deliveryFee={deliveryFee} />
    </div>
  );
};

export default Calculator;
