import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const donutChartProps = {
  component: "DonutChart",
  props: [
    { prop: "label", type: "string", description: "Required accessible name." },
    { prop: "data", type: "ChartData", description: "The parts to plot (Chart.js shape)." },
    { prop: "centerLabel", type: "ReactNode", description: "Content shown in the cutout." },
  ],
  i18n: {
    es: {
      label: "Nombre accesible obligatorio.",
      data: "Las partes a representar (formato de Chart.js).",
      centerLabel: "Contenido mostrado en el recorte central.",
    },
    zh: {
      label: "必填的无障碍名称。",
      data: "要绘制的各部分（Chart.js 格式）。",
      centerLabel: "显示在中心镂空处的内容。",
    },
    fr: {
      label: "Nom accessible obligatoire.",
      data: "Les parts à tracer (format Chart.js).",
      centerLabel: "Contenu affiché dans l'évidement central.",
    },
    de: {
      label: "Erforderlicher zugänglicher Name.",
      data: "Die zu zeichnenden Teile (Chart.js-Form).",
      centerLabel: "Inhalt, der in der Aussparung angezeigt wird.",
    },
    ja: {
      label: "必須のアクセシブルな名前。",
      data: "描画する各部分（Chart.js の形式）。",
      centerLabel: "くり抜き部分に表示される内容。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const donutChartPropRows = (locale) => rowsFor(donutChartProps, locale);
