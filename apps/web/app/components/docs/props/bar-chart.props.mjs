import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const barChartProps = {
  component: "BarChart",
  props: [
    { prop: "label", type: "string", description: "Required accessible name." },
    { prop: "data", type: "ChartData", description: "Categories and series (Chart.js shape)." },
    { prop: "horizontal", type: "boolean", default: "false", description: "Bars run left-to-right." },
    { prop: "stacked", type: "boolean", default: "false", description: "Stack series into one bar." },
    { prop: "valueFormatter", type: "(n: number) => string", description: "Formats tooltip and axis values." },
  ],
};

export const barChartPropRows = () => rowsFor(barChartProps);
