import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const comboboxProps = {
  component: "Combobox",
  props: [
    { prop: "options", type: "ComboboxOption[]", description: "The { value, label } items to choose from." },
    { prop: "value", type: "string", description: "The selected value (controlled)." },
    { prop: "onValueChange", type: "(value: string) => void", description: "Fires on selection." },
    { prop: "placeholder", type: "string", description: "Empty-state text in the input." },
  ],
  i18n: {
    es: {
      options: "Los elementos { value, label } entre los que elegir.",
      value: "El valor seleccionado (controlado).",
      onValueChange: "Se dispara al seleccionar.",
      placeholder: "Texto de estado vacío en el campo de entrada.",
    },
    zh: {
      options: "可供选择的 { value, label } 项。",
      value: "选中的值（受控）。",
      onValueChange: "选择时触发。",
      placeholder: "输入框中的空状态文本。",
    },
    fr: {
      options: "Les éléments { value, label } parmi lesquels choisir.",
      value: "La valeur sélectionnée (contrôlée).",
      onValueChange: "Se déclenche à la sélection.",
      placeholder: "Texte d'état vide dans le champ de saisie.",
    },
    de: {
      options: "Die { value, label }-Einträge zur Auswahl.",
      value: "Der ausgewählte Wert (kontrolliert).",
      onValueChange: "Wird bei der Auswahl ausgelöst.",
      placeholder: "Leerzustandstext im Eingabefeld.",
    },
    ja: {
      options: "選択する { value, label } の項目。",
      value: "選択されている値（制御された状態）。",
      onValueChange: "選択時に発火します。",
      placeholder: "入力欄の空状態テキスト。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const comboboxPropRows = (locale) => rowsFor(comboboxProps, locale);
