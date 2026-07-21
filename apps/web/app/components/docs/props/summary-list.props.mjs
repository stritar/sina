import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const summaryListProps = {
  component: "SummaryList",
  props: [
    { prop: "items", type: "SummaryItem[]", description: "The { label, value, emphasis? } rows." },
    { prop: "emphasis (per item)", type: "boolean", description: "Highlight a key row, like the amount." },
  ],
  i18n: {
    es: {
      items: "Las filas { label, value, emphasis? }.",
      "emphasis (per item)": "Resalta una fila clave, como el importe.",
    },
    zh: {
      items: "{ label, value, emphasis? } 各行。",
      "emphasis (per item)": "突出显示某个关键行，例如金额。",
    },
    fr: {
      items: "Les lignes { label, value, emphasis? }.",
      "emphasis (per item)": "Met en évidence une ligne clé, comme le montant.",
    },
    de: {
      items: "Die Zeilen { label, value, emphasis? }.",
      "emphasis (per item)": "Hebt eine wichtige Zeile hervor, etwa den Betrag.",
    },
    ja: {
      items: "{ label, value, emphasis? } の行。",
      "emphasis (per item)": "金額のような重要な行を強調します。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const summaryListPropRows = (locale) => rowsFor(summaryListProps, locale);
