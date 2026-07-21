import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const alertProps = {
  component: "Alert",
  props: [
    { prop: "variant", type: '"info" | "success" | "warning" | "danger"', default: '"info"', description: "Severity. Also selects the status glyph." },
    { prop: "title", type: "ReactNode", description: "Bold heading for the alert." },
    { prop: "icon", type: "ReactNode | false", description: "Swap the glyph, or hide it for info/success (never for warning/danger)." },
  ],
  i18n: {
    es: {
      variant: "Severidad. También selecciona el glifo de estado.",
      title: "Encabezado en negrita de la alerta.",
      icon: "Cambia el glifo, u ocúltalo para info/success (nunca para warning/danger).",
    },
    zh: {
      variant: "严重程度。同时选择状态字形。",
      title: "警报的粗体标题。",
      icon: "替换字形，或为 info/success 隐藏它（切勿为 warning/danger 隐藏）。",
    },
    fr: {
      variant: "Gravité. Sélectionne aussi le glyphe de statut.",
      title: "Titre en gras de l'alerte.",
      icon: "Remplacez le glyphe, ou masquez-le pour info/success (jamais pour warning/danger).",
    },
    de: {
      variant: "Schweregrad. Wählt außerdem das Status-Glyph aus.",
      title: "Fette Überschrift für die Meldung.",
      icon: "Tauschen Sie das Glyph aus oder blenden Sie es für info/success aus (niemals für warning/danger).",
    },
    ja: {
      variant: "重大度。ステータスの字形も選択します。",
      title: "アラートの太字の見出し。",
      icon: "字形を差し替えるか、info/success では非表示にします（warning/danger では決して非表示にしません）。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const alertPropRows = (locale) => rowsFor(alertProps, locale);
