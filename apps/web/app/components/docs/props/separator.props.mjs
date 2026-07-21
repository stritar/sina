import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const separatorProps = {
  component: "Separator",
  props: [
    { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Divider direction." },
    { prop: "decorative", type: "boolean", default: "true", description: "When false, exposes a separator role to assistive tech." },
  ],
  i18n: {
    es: {
      orientation: "Dirección del divisor.",
      decorative: "Cuando es false, expone un rol separator a la tecnología de asistencia.",
    },
    zh: {
      orientation: "分隔线方向。",
      decorative: "当为 false 时，向辅助技术暴露 separator 角色。",
    },
    fr: {
      orientation: "Direction du séparateur.",
      decorative: "Lorsqu'il vaut false, expose un rôle separator aux technologies d'assistance.",
    },
    de: {
      orientation: "Richtung des Trenners.",
      decorative: "Wenn false, wird der Rolle separator für assistive Technik freigelegt.",
    },
    ja: {
      orientation: "区切り線の向き。",
      decorative: "false のとき、支援技術に separator ロールを公開します。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const separatorPropRows = (locale) => rowsFor(separatorProps, locale);
