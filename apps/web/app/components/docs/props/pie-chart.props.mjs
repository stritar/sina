import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const pieChartProps = {
  component: "PieChart",
  props: [
    { prop: "label", type: "string", description: "Required accessible name." },
    { prop: "data", type: "ChartData", description: "The parts to plot (Chart.js shape)." },
    { prop: "valueFormatter", type: "(n: number) => string", description: "Formats tooltip values." },
  ],
};

export const pieChartPropRows = () => rowsFor(pieChartProps);
