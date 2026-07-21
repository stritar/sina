import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const buttonProps = {
  component: "Button",
  props: [
    { prop: "variant", type: '"primary" | "secondary" | "danger" | "ghost"', default: '"primary"', description: "Visual weight and intent." },
    { prop: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "Control height." },
    { prop: "iconLeft / iconRight", type: "ReactNode", description: "A leading or trailing glyph." },
    { prop: "loading", type: "boolean", default: "false", description: "Shows a spinner and disables the button." },
    { prop: "asChild", type: "boolean", default: "false", description: "Render as the child element (e.g. a link) while keeping button styling." },
  ],
  i18n: {
    es: {
      variant: "Peso visual e intención.",
      size: "Altura del control.",
      "iconLeft / iconRight": "Un glifo al inicio o al final.",
      loading: "Muestra un spinner y desactiva el botón.",
      asChild: "Se renderiza como el elemento hijo (p. ej. un enlace) conservando el estilo del botón.",
    },
    zh: {
      variant: "视觉权重与意图。",
      size: "控件高度。",
      "iconLeft / iconRight": "位于前方或后方的图标。",
      loading: "显示加载指示器并禁用该按钮。",
      asChild: "渲染为子元素（例如一个链接），同时保留按钮样式。",
    },
    fr: {
      variant: "Poids visuel et intention.",
      size: "Hauteur du contrôle.",
      "iconLeft / iconRight": "Un glyphe placé avant ou après.",
      loading: "Affiche un spinner et désactive le bouton.",
      asChild: "Rendu comme l'élément enfant (par ex. un lien) tout en conservant le style du bouton.",
    },
    de: {
      variant: "Visuelle Gewichtung und Absicht.",
      size: "Höhe des Steuerelements.",
      "iconLeft / iconRight": "Eine vorangestellte oder nachgestellte Glyphe.",
      loading: "Zeigt einen Spinner und deaktiviert den Button.",
      asChild: "Wird als das Kindelement gerendert (z. B. ein Link) und behält dabei das Button-Styling bei.",
    },
    ja: {
      variant: "視覚的な重みとインテント。",
      size: "コントロールの高さ。",
      "iconLeft / iconRight": "先頭または末尾のグリフ。",
      loading: "スピナーを表示し、ボタンを無効にします。",
      asChild: "ボタンのスタイルを保ちつつ、子要素（例：リンク）としてレンダリングします。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const buttonPropRows = (locale) => rowsFor(buttonProps, locale);
