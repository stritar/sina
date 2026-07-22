import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const gridProps = {
  component: "Grid",
  props: [
    { prop: "cols", type: "GridCols", description: "Number of columns." },
    { prop: "gap", type: "GapStep", description: "Spacing between cells (from the 8pt scale)." },
    { prop: "as", type: "ElementType", description: "Render as a different element (polymorphic)." },
  ],
};

export const gridPropRows = () => rowsFor(gridProps);
