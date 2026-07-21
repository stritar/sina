import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const stackProps = {
  component: "Stack",
  props: [
    { prop: "direction", type: '"row" | "column"', default: '"column"', description: "Layout axis." },
    { prop: "gap", type: "GapStep", description: "Spacing between children (from the 8pt scale)." },
    { prop: "align / justify", type: "string", description: "Flex alignment along each axis." },
    { prop: "as", type: "ElementType", description: "Render as a different element (polymorphic)." },
  ],
  i18n: {
    es: {
      direction: "Eje de maquetación.",
      gap: "Espaciado entre los hijos (de la escala de 8 pt).",
      "align / justify": "Alineación flex a lo largo de cada eje.",
      as: "Renderiza como un elemento distinto (polimórfico).",
    },
    zh: {
      direction: "布局轴。",
      gap: "子元素之间的间距（取自 8pt 刻度）。",
      "align / justify": "沿每个轴的 Flex 对齐方式。",
      as: "渲染为不同的元素（多态）。",
    },
    fr: {
      direction: "Axe de mise en page.",
      gap: "Espacement entre les enfants (depuis l'échelle de 8 pt).",
      "align / justify": "Alignement flex le long de chaque axe.",
      as: "Rend un élément différent (polymorphe).",
    },
    de: {
      direction: "Layout-Achse.",
      gap: "Abstand zwischen den Kindern (aus der 8-pt-Skala).",
      "align / justify": "Flex-Ausrichtung entlang jeder Achse.",
      as: "Als anderes Element rendern (polymorph).",
    },
    ja: {
      direction: "レイアウトの軸。",
      gap: "子要素間の間隔（8pt スケールから）。",
      "align / justify": "各軸に沿った Flex の配置。",
      as: "別の要素としてレンダリングする（ポリモーフィック）。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const stackPropRows = (locale) => rowsFor(stackProps, locale);
