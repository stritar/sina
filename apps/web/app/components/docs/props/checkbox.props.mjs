import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const checkboxProps = {
  component: "Checkbox",
  props: [
    { prop: "checked", type: 'boolean | "indeterminate"', description: 'Controlled checked state. Pass "indeterminate" for the mixed state.' },
    { prop: "onCheckedChange", type: '(checked: boolean | "indeterminate") => void', description: "Fires on toggle." },
    { prop: "label", type: "ReactNode", description: "Associated label." },
  ],
};

export const checkboxPropRows = () => rowsFor(checkboxProps);
