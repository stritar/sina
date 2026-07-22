import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const fieldProps = {
  component: "Field",
  props: [
    { prop: "label", type: "ReactNode", description: "The field label (associated with the control)." },
    { prop: "description", type: "ReactNode", description: "Helper text below the label." },
    { prop: "error", type: "ReactNode", description: "An error message. Sets aria-invalid and shows a bold warning glyph." },
  ],
};

export const fieldPropRows = () => rowsFor(fieldProps);
