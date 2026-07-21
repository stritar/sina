import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const checkboxProps = {
  component: "Checkbox",
  props: [
    { prop: "checked", type: 'boolean | "indeterminate"', description: 'Controlled checked state. Pass "indeterminate" for the mixed state.' },
    { prop: "onCheckedChange", type: '(checked: boolean | "indeterminate") => void', description: "Fires on toggle." },
    { prop: "label", type: "ReactNode", description: "Associated label." },
  ],
  i18n: {
    es: {
      checked: 'Estado marcado controlado. Pasa "indeterminate" para el estado mixto.',
      onCheckedChange: "Se dispara al alternar.",
      label: "Etiqueta asociada.",
    },
    zh: {
      checked: '受控的选中状态。传入 "indeterminate" 以表示混合状态。',
      onCheckedChange: "切换时触发。",
      label: "关联的标签。",
    },
    fr: {
      checked: "État coché contrôlé. Passez \"indeterminate\" pour l'état mixte.",
      onCheckedChange: "Se déclenche au basculement.",
      label: "Libellé associé.",
    },
    de: {
      checked: 'Kontrollierter Checked-Zustand. Übergib "indeterminate" für den gemischten Zustand.',
      onCheckedChange: "Wird beim Umschalten ausgelöst.",
      label: "Zugehöriges Label.",
    },
    ja: {
      checked: '制御された選択状態。混在状態には "indeterminate" を渡します。',
      onCheckedChange: "切り替え時に発火します。",
      label: "関連付けられたラベル。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const checkboxPropRows = (locale) => rowsFor(checkboxProps, locale);
