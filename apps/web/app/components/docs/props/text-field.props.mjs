import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const textFieldProps = {
  component: "TextField",
  props: [
    { prop: "multiline", type: "boolean", default: "false", description: "Render a textarea instead of an input." },
    { prop: "label / description / error", type: "ReactNode", description: "Passed through to the wrapping Field." },
  ],
};

export const textFieldPropRows = () => rowsFor(textFieldProps);
