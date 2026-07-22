import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const comboboxProps = {
  component: "Combobox",
  props: [
    { prop: "options", type: "ComboboxOption[]", description: "The { value, label } items to choose from." },
    { prop: "value", type: "string", description: "The selected value (controlled)." },
    { prop: "onValueChange", type: "(value: string) => void", description: "Fires on selection." },
    { prop: "placeholder", type: "string", description: "Empty-state text in the input." },
  ],
};

export const comboboxPropRows = () => rowsFor(comboboxProps);
