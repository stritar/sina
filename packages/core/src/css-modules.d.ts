/**
 * @sina-design-system/core — CSS Modules ambient types
 *
 * Lets `tsc` (and editors) type `import styles from "./X.module.css"`. At build
 * time Vite compiles the module to scoped class names; this only satisfies the
 * type layer. Keys are the flat class names authored in each `*.module.css`.
 */
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
