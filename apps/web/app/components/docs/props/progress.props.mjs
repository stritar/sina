import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const progressProps = {
  component: "Progress",
  props: [
    { prop: "value", type: "number", description: "0 to 100. Omit for an indeterminate bar." },
    { prop: "label", type: "string", description: "Accessible name for the progressbar." },
  ],
  i18n: {
    es: {
      value: "De 0 a 100. Omítelo para una barra indeterminada.",
      label: "Nombre accesible para la barra de progreso.",
    },
    zh: {
      value: "0 到 100。省略则为不确定进度条。",
      label: "进度条的无障碍名称。",
    },
    fr: {
      value: "De 0 à 100. Omettez-la pour une barre indéterminée.",
      label: "Nom accessible pour la barre de progression.",
    },
    de: {
      value: "0 bis 100. Weglassen für einen unbestimmten Balken.",
      label: "Zugänglicher Name für die Fortschrittsanzeige.",
    },
    ja: {
      value: "0 から 100。不確定なバーの場合は省略します。",
      label: "プログレスバーのアクセシブルな名前。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const progressPropRows = (locale) => rowsFor(progressProps, locale);
