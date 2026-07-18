import type { ReactNode } from "react";

/**
 * The registry contract. Each Broadsheet component declares a controls schema;
 * the showcase sandbox auto-generates its sidebar from it, and the a11y +
 * focus guards iterate it. Adding a component is one ComponentSpec entry.
 */

export type Control =
  | {
      key: string;
      label: string;
      type: "select";
      options: readonly string[];
      default: string;
    }
  | { key: string; label: string; type: "boolean"; default: boolean }
  | { key: string; label: string; type: "text"; default: string };

export type ControlValues = Record<string, string | boolean>;

export type ComponentSpec = {
  /** Stable id, kebab-case (also the sandbox route hash). */
  id: string;
  /** Human label shown in the component picker. */
  name: string;
  controls: readonly Control[];
  /** Map the current control values to a rendered component. */
  render: (values: ControlValues) => ReactNode;
};
