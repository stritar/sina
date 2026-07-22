/**
 * Shared Prettier preset for the SINA monorepo.
 * Consume from a workspace via:  module.exports = require("@sina-design-system/config/prettier");
 * @type {import("prettier").Config}
 */
module.exports = {
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  tabWidth: 2,
  arrowParens: "always",
};
