import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const currencyFieldProps = {
  component: "CurrencyField",
  props: [
    { prop: "currencySymbol", type: "string", default: '"$"', description: "The symbol shown before the amount." },
    { prop: "label / description / error", type: "ReactNode", description: "Passed through to the wrapping Field." },
  ],
};

export const currencyFieldPropRows = () => rowsFor(currencyFieldProps);
