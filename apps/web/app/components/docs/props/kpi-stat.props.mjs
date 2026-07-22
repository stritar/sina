import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const kpiStatProps = {
  component: "KpiStat",
  props: [
    { prop: "value", type: "number | null", description: "The headline figure; null renders displayNullAs." },
    { prop: "valueFormatter", type: "(value: number) => string", description: "Formats the value and the delta (currency etc.)." },
    { prop: "comparisonValue", type: "number", description: "A prior value. Renders the trend pill." },
    { prop: "comparisonLabel", type: "string", description: "Context under the pill, e.g. “vs previous period”." },
    { prop: "showChangeAsPercentage", type: "boolean", default: "false", description: "Show the delta as a percentage." },
    { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Tile scale." },
    { prop: "invertChangeColors", type: "boolean", default: "false", description: "When down is good (e.g. spending)." },
  ],
};

export const kpiStatPropRows = () => rowsFor(kpiStatProps);
