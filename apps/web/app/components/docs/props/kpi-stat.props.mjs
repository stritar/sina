import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const kpiStatProps = {
  component: "KpiStat",
  props: [
    { prop: "value", type: "number | null", description: "The headline figure; null renders displayNullAs." },
    { prop: "valueFormatter", type: "(value: number) => string", description: "Formats the value and the delta (currency etc.)." },
    { prop: "comparisonValue", type: "number", description: "A prior value. Renders the trend pill." },
    { prop: "comparisonLabel", type: "string", description: "Context under the pill, e.g. “vs previous period”." },
    { prop: "showChangeAsPercentage", type: "boolean", default: "false", description: "Show the delta as a percentage." },
    { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Tile scale." },
    { prop: "invertChangeColors", type: "boolean", default: "false", description: "When down is good (e.g. spending)." },
  ],
  i18n: {
    es: {
      value: "La cifra principal; null renderiza displayNullAs.",
      valueFormatter: "Formatea el valor y el delta (moneda, etc.).",
      comparisonValue: "Un valor anterior. Renderiza la píldora de tendencia.",
      comparisonLabel: "Contexto bajo la píldora, p. ej. “frente al período anterior”.",
      showChangeAsPercentage: "Muestra el delta como porcentaje.",
      size: "Escala del recuadro.",
      invertChangeColors: "Cuando bajar es bueno (p. ej. el gasto).",
    },
    zh: {
      value: "主要数字；null 会渲染 displayNullAs。",
      valueFormatter: "格式化数值和差值（货币等）。",
      comparisonValue: "先前的数值。渲染趋势胶囊标签。",
      comparisonLabel: "胶囊标签下方的上下文，例如“较上一周期”。",
      showChangeAsPercentage: "以百分比形式显示差值。",
      size: "卡片尺寸。",
      invertChangeColors: "当下降为好时（例如支出）。",
    },
    fr: {
      value: "Le chiffre principal ; null rend displayNullAs.",
      valueFormatter: "Formate la valeur et le delta (devise, etc.).",
      comparisonValue: "Une valeur antérieure. Rend la pastille de tendance.",
      comparisonLabel: "Contexte sous la pastille, p. ex. « par rapport à la période précédente ».",
      showChangeAsPercentage: "Affiche le delta en pourcentage.",
      size: "Échelle de la tuile.",
      invertChangeColors: "Quand la baisse est positive (p. ex. les dépenses).",
    },
    de: {
      value: "Die Hauptzahl; null rendert displayNullAs.",
      valueFormatter: "Formatiert den Wert und das Delta (Währung usw.).",
      comparisonValue: "Ein früherer Wert. Rendert die Trend-Pille.",
      comparisonLabel: "Kontext unter der Pille, z. B. „gegenüber dem Vorzeitraum“.",
      showChangeAsPercentage: "Zeigt das Delta als Prozentsatz an.",
      size: "Kachelgröße.",
      invertChangeColors: "Wenn ein Rückgang gut ist (z. B. Ausgaben).",
    },
    ja: {
      value: "主要な数字。null の場合は displayNullAs をレンダリングします。",
      valueFormatter: "値と差分（通貨など）をフォーマットします。",
      comparisonValue: "以前の値。トレンドのピルを表示します。",
      comparisonLabel: "ピルの下のコンテキスト。例：「前期比」。",
      showChangeAsPercentage: "差分をパーセンテージで表示します。",
      size: "タイルのスケール。",
      invertChangeColors: "下降が良い場合（例：支出）。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const kpiStatPropRows = (locale) => rowsFor(kpiStatProps, locale);
