import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const spinnerProps = {
  component: "Spinner",
  props: [
    { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Indicator size." },
    { prop: "label", type: "string", description: "Announced to screen readers (visually hidden)." },
  ],
};

export const spinnerPropRows = () => rowsFor(spinnerProps);
