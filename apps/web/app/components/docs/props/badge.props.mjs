import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const badgeProps = {
  component: "Badge",
  props: [
    { prop: "intent", type: '"neutral" | "info" | "success" | "warning" | "danger"', default: '"neutral"', description: "Color and meaning." },
    { prop: "size", type: '"sm" | "md"', default: '"md"', description: "Chip size." },
    { prop: "icon", type: "ReactNode", description: "A leading glyph (inherits the label color)." },
    { prop: "dot", type: "boolean", default: "false", description: "A leading status dot." },
  ],
  i18n: {
    es: {
      intent: "Color y significado.",
      size: "Tamaño del chip.",
      icon: "Un glifo inicial (hereda el color de la etiqueta).",
      dot: "Un punto de estado inicial.",
    },
    zh: {
      intent: "颜色与含义。",
      size: "标签尺寸。",
      icon: "前置字形（继承标签颜色）。",
      dot: "前置状态圆点。",
    },
    fr: {
      intent: "Couleur et signification.",
      size: "Taille de la puce.",
      icon: "Un glyphe en tête (hérite de la couleur du libellé).",
      dot: "Un point de statut en tête.",
    },
    de: {
      intent: "Farbe und Bedeutung.",
      size: "Chip-Größe.",
      icon: "Ein vorangestelltes Glyph (erbt die Beschriftungsfarbe).",
      dot: "Ein vorangestellter Statuspunkt.",
    },
    ja: {
      intent: "色と意味。",
      size: "チップのサイズ。",
      icon: "先頭の字形（ラベルの色を継承します）。",
      dot: "先頭のステータスドット。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const badgePropRows = (locale) => rowsFor(badgeProps, locale);
