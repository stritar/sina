import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const progressProps = {
  component: "Progress",
  props: [
    { prop: "value", type: "number", description: "0 to 100. Omit for an indeterminate bar." },
    { prop: "label", type: "string", description: "Accessible name for the progressbar." },
  ],
};

export const progressPropRows = () => rowsFor(progressProps);
