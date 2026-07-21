import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const spinnerProps = {
  component: "Spinner",
  props: [
    { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Indicator size." },
    { prop: "label", type: "string", description: "Announced to screen readers (visually hidden)." },
  ],
  i18n: {
    es: {
      size: "Tamaño del indicador.",
      label: "Se anuncia a los lectores de pantalla (oculto visualmente).",
    },
    zh: {
      size: "指示器尺寸。",
      label: "向屏幕阅读器播报（视觉上隐藏）。",
    },
    fr: {
      size: "Taille de l'indicateur.",
      label: "Annoncé aux lecteurs d'écran (masqué visuellement).",
    },
    de: {
      size: "Größe des Indikators.",
      label: "Wird Screenreadern angesagt (visuell verborgen).",
    },
    ja: {
      size: "インジケーターのサイズ。",
      label: "スクリーンリーダーに読み上げられます（視覚的には非表示）。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const spinnerPropRows = (locale) => rowsFor(spinnerProps, locale);
