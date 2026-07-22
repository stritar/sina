import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const buttonProps = {
  component: "Button",
  props: [
    { prop: "variant", type: '"primary" | "secondary" | "danger" | "ghost"', default: '"primary"', description: "Visual weight and intent." },
    { prop: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "Control height." },
    { prop: "iconLeft / iconRight", type: "ReactNode", description: "A leading or trailing glyph." },
    { prop: "loading", type: "boolean", default: "false", description: "Shows a spinner and disables the button." },
    { prop: "asChild", type: "boolean", default: "false", description: "Render as the child element (e.g. a link) while keeping button styling." },
  ],
};

export const buttonPropRows = () => rowsFor(buttonProps);
