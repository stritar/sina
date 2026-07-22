import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const stackProps = {
  component: "Stack",
  props: [
    { prop: "direction", type: '"row" | "col"', default: '"col"', description: "Layout axis." },
    { prop: "gap", type: "GapStep", description: "Spacing between children (from the 8pt scale)." },
    { prop: "align / justify", type: "string", description: "Flex alignment along each axis." },
    { prop: "as", type: "ElementType", description: "Render as a different element (polymorphic)." },
  ],
};

export const stackPropRows = () => rowsFor(stackProps);
