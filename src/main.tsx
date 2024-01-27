import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "react-datetime/css/react-datetime.css";
import "./index.css";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/en";
import fi from "./i18n/fi";

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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
