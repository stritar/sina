import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const lineChartProps = {
  component: "LineChart",
  props: [
    { prop: "label", type: "string", description: "Required accessible name for the chart." },
    { prop: "data", type: "ChartData", description: "Series and points (Chart.js shape)." },
    { prop: "valueFormatter", type: "(n: number) => string", description: "Formats tooltip and axis values. Keeps the chart domain-agnostic." },
    { prop: "fill", type: "boolean", default: "false", description: "Render as an area chart." },
  ],
  i18n: {
    es: {
      label: "Nombre accesible obligatorio para el gráfico.",
      data: "Series y puntos (formato de Chart.js).",
      valueFormatter: "Da formato a los valores del tooltip y del eje. Mantiene el gráfico independiente del dominio.",
      fill: "Renderiza como un gráfico de área.",
    },
    zh: {
      label: "图表必需的无障碍名称。",
      data: "序列与数据点（Chart.js 结构）。",
      valueFormatter: "格式化提示框与坐标轴的数值。使图表保持与领域无关。",
      fill: "渲染为面积图。",
    },
    fr: {
      label: "Nom accessible obligatoire pour le graphique.",
      data: "Séries et points (format Chart.js).",
      valueFormatter: "Met en forme les valeurs de l'infobulle et de l'axe. Garde le graphique indépendant du domaine.",
      fill: "Rendu sous forme de graphique en aires.",
    },
    de: {
      label: "Erforderlicher barrierefreier Name für das Diagramm.",
      data: "Datenreihen und Punkte (Chart.js-Format).",
      valueFormatter: "Formatiert Tooltip- und Achsenwerte. Hält das Diagramm domänenunabhängig.",
      fill: "Als Flächendiagramm rendern.",
    },
    ja: {
      label: "チャートに必須のアクセシブルな名前。",
      data: "系列と点（Chart.js の形式）。",
      valueFormatter: "ツールチップと軸の値をフォーマットします。チャートをドメインに依存しないまま保ちます。",
      fill: "エリアチャートとしてレンダリングします。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const lineChartPropRows = (locale) => rowsFor(lineChartProps, locale);
