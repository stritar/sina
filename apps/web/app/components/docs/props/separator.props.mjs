import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const separatorProps = {
  component: "Separator",
  props: [
    { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Divider direction." },
    { prop: "decorative", type: "boolean", default: "true", description: "When false, exposes a separator role to assistive tech." },
  ],
};

export const separatorPropRows = () => rowsFor(separatorProps);
