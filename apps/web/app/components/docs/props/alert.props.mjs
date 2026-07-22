import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const alertProps = {
  component: "Alert",
  props: [
    { prop: "variant", type: '"info" | "success" | "warning" | "danger"', default: '"info"', description: "Severity. Also selects the status glyph." },
    { prop: "title", type: "ReactNode", description: "Bold heading for the alert." },
    { prop: "icon", type: "PhosphorIcon | false", description: "Swap the glyph component, or hide it for info/success (keep one for warning/danger)." },
  ],
};

export const alertPropRows = () => rowsFor(alertProps);
