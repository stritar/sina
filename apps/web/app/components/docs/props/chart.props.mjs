import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const chartProps = {
  component: "Chart",
  props: [
    { prop: "variant", type: '"line" | "area" | "bar"', default: '"line"', description: "Sparkline style." },
    { prop: "data", type: "number[]", description: "The series to plot." },
  ],
};

export const chartPropRows = () => rowsFor(chartProps);
