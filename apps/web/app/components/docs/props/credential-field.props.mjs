import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const credentialFieldProps = {
  component: "CredentialField",
  props: [
    { prop: "length", type: "number", default: "6", description: "CredentialOTP: the number of digits." },
    { prop: "onChange", type: "(value: string) => void", description: "CredentialOTP: fires on every edit with the current value." },
    { prop: "label / description / error", type: "ReactNode", description: "Field wiring, as usual." },
  ],
};

export const credentialFieldPropRows = () => rowsFor(credentialFieldProps);
