import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const fieldProps = {
  component: "Field",
  props: [
    { prop: "label", type: "ReactNode", description: "The field label (associated with the control)." },
    { prop: "description", type: "ReactNode", description: "Helper text below the label." },
    { prop: "error", type: "ReactNode", description: "An error message. Sets aria-invalid and shows a bold warning glyph." },
  ],
  i18n: {
    es: {
      label: "La etiqueta del campo (asociada con el control).",
      description: "Texto de ayuda debajo de la etiqueta.",
      error: "Un mensaje de error. Establece aria-invalid y muestra un glifo de advertencia en negrita.",
    },
    zh: {
      label: "字段标签（与控件关联）。",
      description: "标签下方的帮助文本。",
      error: "错误消息。设置 aria-invalid 并显示一个加粗的警告字形。",
    },
    fr: {
      label: "L'étiquette du champ (associée au contrôle).",
      description: "Texte d'aide sous l'étiquette.",
      error: "Un message d'erreur. Définit aria-invalid et affiche un glyphe d'avertissement en gras.",
    },
    de: {
      label: "Das Label des Felds (mit dem Steuerelement verknüpft).",
      description: "Hilfetext unter dem Label.",
      error: "Eine Fehlermeldung. Setzt aria-invalid und zeigt ein fettes Warnglyph an.",
    },
    ja: {
      label: "フィールドのラベル（コントロールに関連付けられます）。",
      description: "ラベルの下に表示される補助テキスト。",
      error: "エラーメッセージ。aria-invalid を設定し、太字の警告グリフを表示します。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const fieldPropRows = (locale) => rowsFor(fieldProps, locale);
