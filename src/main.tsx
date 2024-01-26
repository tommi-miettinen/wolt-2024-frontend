import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "react-datetime/css/react-datetime.css";
import "./index.css";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const en = {
  calculateCostOfDelivery: "Calculate cost of delivery",
  cartValue: "Cart value",
  deliveryDistance: "Delivery distance",
  numberOfItems: "Number of items",
  orderDate: "Order date",
  costOfDelivery: "Cost of delivery",
};

const fi = {
  calculateCostOfDelivery: "Laske toimituksen hinta",
  cartValue: "Korin arvo",
  deliveryDistance: "Toimitusmatka",
  numberOfItems: "Tuotteiden lukumäärä",
  orderDate: "Tilauksen päivämäärä",
  costOfDelivery: "Toimituksen hinta",
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
