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
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    fi: {
      translation: fi,
    },
  },
  lng: "en",
  fallbackLng: "en",
});
