import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const badgeProps = {
  component: "Badge",
  props: [
    { prop: "intent", type: '"neutral" | "info" | "success" | "warning" | "danger"', default: '"neutral"', description: "Color and meaning." },
    { prop: "size", type: '"sm" | "md"', default: '"md"', description: "Chip size." },
    { prop: "icon", type: "PhosphorIcon", description: "A leading glyph component (inherits the label color)." },
    { prop: "dot", type: "boolean", default: "false", description: "A leading status dot." },
  ],
};

export const badgePropRows = () => rowsFor(badgeProps);
