import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import fi from "./fi";

export enum TranslationKeys {
  CART_VALUE = "cartValue",
  NUMBER_OF_ITEMS = "numberOfItems",
  DELIVERY_DISTANCE = "deliveryDistance",
  ORDER_DATE = "orderDate",
  COST_OF_DELIVERY = "costOfDelivery",
  CALCULATE_COST_OF_DELIVERY = "calculateCostOfDelivery",
  CART_VALUE_PLACEHOLDER = "cartValuePlaceholder",
  NUMBER_OF_ITEMS_PLACEHOLDER = "numberOfItemsPlaceholder",
  DELIVERY_DISTANCE_PLACEHOLDER = "deliveryDistancePlaceholder",
  COST_OF_DELIVERY_INCOMPLETE_INPUT = "costOfDeliveryIncompleteInput",
  SKIP_TO_MAIN_CONTENT = "skipToMainContent",
  DARK_THEME = "darkTheme",
  CART_VALUE_HELPER_TEXT = "cartValueHelperText",
  NUMBER_OF_ITEMS_INPUT_INFO = "numberOfItemsInputInfo",
  DELIVERY_DISTANCE_INPUT_INFO = "deliveryDistanceInputInfo",
  ORDER_DATE_INPUT_INFO = "orderDateInputInfo",
  CART_VALUE_INPUT_INFO = "cartValueInputInfo",
}

export type Translations = {
  [value in TranslationKeys]: string;
};

export const initializei18n = async () => {
  await i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: en,
      },
      fi: {
        translation: fi,
      },
    },
    lng: navigator.language.split("-")[0],
    fallbackLng: "en",
  });

  document.documentElement.lang = i18n.language;
};

initializei18n();
