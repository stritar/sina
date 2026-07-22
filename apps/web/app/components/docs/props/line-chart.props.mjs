import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const lineChartProps = {
  component: "LineChart",
  props: [
    { prop: "label", type: "string", description: "Required accessible name for the chart." },
    { prop: "data", type: "ChartData", description: "Series and points (Chart.js shape)." },
    { prop: "valueFormatter", type: "(n: number) => string", description: "Formats tooltip and axis values. Keeps the chart domain-agnostic." },
    { prop: "fill", type: "boolean", default: "false", description: "Render as an area chart." },
  ],
};

export const lineChartPropRows = () => rowsFor(lineChartProps);
