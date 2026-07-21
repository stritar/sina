import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const currencyFieldProps = {
  component: "CurrencyField",
  props: [
    { prop: "currencySymbol", type: "string", default: '"$"', description: "The symbol shown before the amount." },
    { prop: "label / description / error", type: "ReactNode", description: "Passed through to the wrapping Field." },
  ],
  i18n: {
    es: {
      currencySymbol: "El símbolo que se muestra antes del importe.",
      "label / description / error": "Se pasa al Field que lo envuelve.",
    },
    zh: {
      currencySymbol: "显示在金额前面的符号。",
      "label / description / error": "透传给外层包裹的 Field。",
    },
    fr: {
      currencySymbol: "Le symbole affiché avant le montant.",
      "label / description / error": "Transmis au Field englobant.",
    },
    de: {
      currencySymbol: "Das vor dem Betrag angezeigte Symbol.",
      "label / description / error": "Wird an das umschließende Field durchgereicht.",
    },
    ja: {
      currencySymbol: "金額の前に表示される記号。",
      "label / description / error": "外側の Field にそのまま渡されます。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const currencyFieldPropRows = (locale) => rowsFor(currencyFieldProps, locale);
