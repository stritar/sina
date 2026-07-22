/**
 * @sina-design-system/fintech-react — CSS Modules ambient types.
 * Lets tsc/editors type `import styles from "./X.module.css"`; Vite compiles the
 * real scoped names at build.
 */
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
