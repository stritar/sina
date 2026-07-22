import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const iconProps = {
  component: "Icon",
  props: [
    { prop: "label", type: "string", description: "Announced to screen readers. Use when the icon conveys meaning." },
    { prop: "decorative", type: "boolean", description: "Hides the icon from assistive tech (aria-hidden)." },
  ],
};

export const iconPropRows = () => rowsFor(iconProps);
