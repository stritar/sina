import { rowsFor } from "./prop-docs.mjs";

/** @type {import("./prop-docs.mjs").PropDoc} */
export const credentialFieldProps = {
  component: "CredentialField",
  props: [
    { prop: "length", type: "number", default: "6", description: "CredentialOTP: the number of digits." },
    { prop: "onComplete", type: "(code: string) => void", description: "CredentialOTP: fires when every digit is entered." },
    { prop: "label / description / error", type: "ReactNode", description: "Field wiring, as usual." },
  ],
  i18n: {
    es: {
      length: "CredentialOTP: el número de dígitos.",
      onComplete: "CredentialOTP: se dispara cuando se han introducido todos los dígitos.",
      "label / description / error": "Conexión del campo, como de costumbre.",
    },
    zh: {
      length: "CredentialOTP：位数。",
      onComplete: "CredentialOTP：当每一位数字都输入完成时触发。",
      "label / description / error": "字段接线，一如往常。",
    },
    fr: {
      length: "CredentialOTP : le nombre de chiffres.",
      onComplete: "CredentialOTP : se déclenche lorsque chaque chiffre est saisi.",
      "label / description / error": "Câblage du champ, comme d'habitude.",
    },
    de: {
      length: "CredentialOTP: die Anzahl der Ziffern.",
      onComplete: "CredentialOTP: wird ausgelöst, sobald jede Ziffer eingegeben ist.",
      "label / description / error": "Feldverdrahtung, wie üblich.",
    },
    ja: {
      length: "CredentialOTP: 桁数。",
      onComplete: "CredentialOTP: すべての桁が入力されたときに発火します。",
      "label / description / error": "フィールドの配線。いつもどおりです。",
    },
  },
};

/** @param {import("./prop-docs.mjs").PropLocale} [locale] */
export const credentialFieldPropRows = (locale) => rowsFor(credentialFieldProps, locale);
