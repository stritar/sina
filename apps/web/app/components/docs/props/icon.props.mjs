import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const iconProps = {
  component: "Icon",
  props: [
    { prop: "label", type: "string", description: "Announced to screen readers. Use when the icon conveys meaning." },
    { prop: "decorative", type: "boolean", description: "Hides the icon from assistive tech (aria-hidden)." },
  ],
  i18n: {
    es: {
      label: "Se anuncia a los lectores de pantalla. Úsalo cuando el icono transmite significado.",
      decorative: "Oculta el icono a la tecnología de asistencia (aria-hidden).",
    },
    zh: {
      label: "向屏幕阅读器播报。当图标传达含义时使用。",
      decorative: "对辅助技术隐藏图标（aria-hidden）。",
    },
    fr: {
      label: "Annoncé aux lecteurs d'écran. À utiliser lorsque l'icône véhicule un sens.",
      decorative: "Masque l'icône aux technologies d'assistance (aria-hidden).",
    },
    de: {
      label: "Wird an Screenreader angesagt. Verwende es, wenn das Icon eine Bedeutung transportiert.",
      decorative: "Blendet das Icon vor assistiven Technologien aus (aria-hidden).",
    },
    ja: {
      label: "スクリーンリーダーに読み上げられます。アイコンが意味を伝えるときに使用します。",
      decorative: "支援技術からアイコンを隠します（aria-hidden）。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const iconPropRows = (locale) => rowsFor(iconProps, locale);
