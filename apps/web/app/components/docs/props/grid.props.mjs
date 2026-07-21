import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const gridProps = {
  component: "Grid",
  props: [
    { prop: "cols", type: "GridCols", description: "Number of columns." },
    { prop: "gap", type: "GapStep", description: "Spacing between cells (from the 8pt scale)." },
    { prop: "as", type: "ElementType", description: "Render as a different element (polymorphic)." },
  ],
  i18n: {
    es: {
      cols: "Número de columnas.",
      gap: "Espaciado entre celdas (de la escala de 8pt).",
      as: "Renderiza como un elemento diferente (polimórfico).",
    },
    zh: {
      cols: "列的数量。",
      gap: "单元格之间的间距（来自 8pt 刻度）。",
      as: "渲染为不同的元素（多态）。",
    },
    fr: {
      cols: "Nombre de colonnes.",
      gap: "Espacement entre les cellules (issu de l'échelle de 8pt).",
      as: "Rendu sous la forme d'un élément différent (polymorphe).",
    },
    de: {
      cols: "Anzahl der Spalten.",
      gap: "Abstand zwischen den Zellen (aus der 8pt-Skala).",
      as: "Als anderes Element rendern (polymorph).",
    },
    ja: {
      cols: "列の数。",
      gap: "セル間の間隔（8pt スケールから）。",
      as: "別の要素としてレンダリングします（ポリモーフィック）。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const gridPropRows = (locale) => rowsFor(gridProps, locale);
