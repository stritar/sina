import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const donutChartProps = {
  component: "DonutChart",
  props: [
    { prop: "label", type: "string", description: "Required accessible name." },
    { prop: "data", type: "ChartData", description: "The parts to plot (Chart.js shape)." },
    { prop: "centerLabel", type: "string", description: "Text shown in the cutout." },
  ],
};

export const donutChartPropRows = () => rowsFor(donutChartProps);
