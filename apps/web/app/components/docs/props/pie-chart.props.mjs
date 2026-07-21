import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const pieChartProps = {
  component: "PieChart",
  props: [
    { prop: "label", type: "string", description: "Required accessible name." },
    { prop: "data", type: "ChartData", description: "The parts to plot (Chart.js shape)." },
    { prop: "valueFormatter", type: "(n: number) => string", description: "Formats tooltip values." },
  ],
  i18n: {
    es: {
      label: "Nombre accesible obligatorio.",
      data: "Las partes que se representan (formato de Chart.js).",
      valueFormatter: "Da formato a los valores del tooltip.",
    },
    zh: {
      label: "必需的无障碍名称。",
      data: "要绘制的各个部分（Chart.js 格式）。",
      valueFormatter: "格式化工具提示的数值。",
    },
    fr: {
      label: "Nom accessible requis.",
      data: "Les parties à tracer (format Chart.js).",
      valueFormatter: "Formate les valeurs de l'infobulle.",
    },
    de: {
      label: "Erforderlicher barrierefreier Name.",
      data: "Die zu plottenden Teile (Chart.js-Format).",
      valueFormatter: "Formatiert die Tooltip-Werte.",
    },
    ja: {
      label: "必須のアクセシブルな名前。",
      data: "プロットする各部分（Chart.js の形式）。",
      valueFormatter: "ツールチップの値をフォーマットします。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const pieChartPropRows = (locale) => rowsFor(pieChartProps, locale);
