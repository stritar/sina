import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const barChartProps = {
  component: "BarChart",
  props: [
    { prop: "label", type: "string", description: "Required accessible name." },
    { prop: "data", type: "ChartData", description: "Categories and series (Chart.js shape)." },
    { prop: "horizontal", type: "boolean", default: "false", description: "Bars run left-to-right." },
    { prop: "stacked", type: "boolean", default: "false", description: "Stack series into one bar." },
    { prop: "valueFormatter", type: "(n: number) => string", description: "Formats tooltip and axis values." },
  ],
  i18n: {
    es: {
      label: "Nombre accesible obligatorio.",
      data: "Categorías y series (forma de Chart.js).",
      horizontal: "Las barras van de izquierda a derecha.",
      stacked: "Apila las series en una sola barra.",
      valueFormatter: "Formatea los valores del tooltip y del eje.",
    },
    zh: {
      label: "必需的无障碍名称。",
      data: "类别和系列（Chart.js 结构）。",
      horizontal: "条形从左到右延伸。",
      stacked: "将各系列堆叠到一个条形中。",
      valueFormatter: "格式化提示框和坐标轴的数值。",
    },
    fr: {
      label: "Nom accessible obligatoire.",
      data: "Catégories et séries (structure Chart.js).",
      horizontal: "Les barres se déploient de gauche à droite.",
      stacked: "Empile les séries en une seule barre.",
      valueFormatter: "Met en forme les valeurs de l'infobulle et de l'axe.",
    },
    de: {
      label: "Erforderlicher zugänglicher Name.",
      data: "Kategorien und Reihen (Chart.js-Struktur).",
      horizontal: "Balken verlaufen von links nach rechts.",
      stacked: "Reihen zu einem Balken stapeln.",
      valueFormatter: "Formatiert Tooltip- und Achsenwerte.",
    },
    ja: {
      label: "必須のアクセシブルな名前。",
      data: "カテゴリとシリーズ（Chart.js の形式）。",
      horizontal: "バーは左から右へ伸びます。",
      stacked: "シリーズを 1 本のバーに積み重ねます。",
      valueFormatter: "ツールチップと軸の値を整形します。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const barChartPropRows = (locale) => rowsFor(barChartProps, locale);
