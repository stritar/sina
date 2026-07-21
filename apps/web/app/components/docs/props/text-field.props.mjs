import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const textFieldProps = {
  component: "TextField",
  props: [
    { prop: "multiline", type: "boolean", default: "false", description: "Render a textarea instead of an input." },
    { prop: "label / description / error", type: "ReactNode", description: "Passed through to the wrapping Field." },
  ],
  i18n: {
    es: {
      multiline: "Renderiza un textarea en lugar de un input.",
      "label / description / error": "Se pasan al Field que lo envuelve.",
    },
    zh: {
      multiline: "渲染一个 textarea 而非 input。",
      "label / description / error": "透传给包裹它的 Field。",
    },
    fr: {
      multiline: "Rend un textarea au lieu d'un input.",
      "label / description / error": "Transmis au Field qui l'enveloppe.",
    },
    de: {
      multiline: "Rendert ein textarea statt eines input.",
      "label / description / error": "Wird an das umschließende Field durchgereicht.",
    },
    ja: {
      multiline: "input ではなく textarea をレンダリングします。",
      "label / description / error": "ラップする Field にそのまま渡されます。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const textFieldPropRows = (locale) => rowsFor(textFieldProps, locale);
