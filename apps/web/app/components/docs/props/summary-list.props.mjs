import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const summaryListProps = {
  component: "SummaryList",
  props: [
    { prop: "items", type: "SummaryItem[]", description: "The { label, value, emphasis? } rows." },
    { prop: "emphasis (per item)", type: "boolean", description: "Highlight a key row, like the amount." },
  ],
};

export const summaryListPropRows = () => rowsFor(summaryListProps);
