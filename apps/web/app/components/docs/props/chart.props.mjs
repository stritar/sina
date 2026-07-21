import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const chartProps = {
  component: "Chart",
  props: [
    { prop: "variant", type: '"line" | "area" | "bar"', default: '"line"', description: "Sparkline style." },
    { prop: "data", type: "number[]", description: "The series to plot." },
  ],
  i18n: {
    es: {
      variant: "Estilo del sparkline.",
      data: "La serie que se va a trazar.",
    },
    zh: {
      variant: "迷你图样式。",
      data: "要绘制的数据系列。",
    },
    fr: {
      variant: "Style du sparkline.",
      data: "La série à tracer.",
    },
    de: {
      variant: "Sparkline-Stil.",
      data: "Die zu zeichnende Datenreihe.",
    },
    ja: {
      variant: "スパークラインのスタイル。",
      data: "プロットする系列。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const chartPropRows = (locale) => rowsFor(chartProps, locale);
