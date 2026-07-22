"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { REGISTRY } from "../broadsheet/registry";
import type { Control, ControlValues } from "../broadsheet/types";
import styles from "./Sandbox.module.css";

/** Seed a spec's control values from their declared defaults. */
function defaults(controls: readonly Control[]): ControlValues {
  const values: ControlValues = {};
  for (const control of controls) values[control.key] = control.default;
  return values;
}

/**
 * The registry-driven marketing sandbox: a left sidebar of controls generated
 * from the selected component's schema, and a live preview on the right. No
 * code panel. Adding a component to REGISTRY makes it appear here automatically.
 */
export function Sandbox() {
  const specs = REGISTRY;
  const first = specs[0];
  const [activeId, setActiveId] = useState<string>(first ? first.id : "");
  const spec = useMemo(
    () => specs.find((candidate) => candidate.id === activeId) ?? first,
    [specs, activeId, first],
  );

  // Keep each component's edits independent so switching does not reset them.
  const [valuesById, setValuesById] = useState<Record<string, ControlValues>>(() =>
    Object.fromEntries(specs.map((candidate) => [candidate.id, defaults(candidate.controls)])),
  );

  if (!spec) return null;
  const values = valuesById[spec.id] ?? defaults(spec.controls);

  function setValue(key: string, value: string | boolean) {
    setValuesById((prev) => ({ ...prev, [spec!.id]: { ...prev[spec!.id], [key]: value } }));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>SINA marketing</p>
          <h1 className={styles.title}>Broadsheet components</h1>
          <p className={styles.subtitle}>
            Pick a component, toggle its props, and preview every state.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Component controls">
          <section className={styles.group}>
            <h2 className={styles.groupTitle}>Component</h2>
            <div className={styles.segments} role="radiogroup" aria-label="Component">
              {specs.map((candidate) => (
                <label
                  key={candidate.id}
                  className={styles.segment}
                  data-selected={candidate.id === spec.id || undefined}
                >
                  <input
                    className={styles.srInput}
                    type="radio"
                    name="bs-component"
                    value={candidate.id}
                    checked={candidate.id === spec.id}
                    onChange={() => setActiveId(candidate.id)}
                  />
                  <span>{candidate.name}</span>
                </label>
              ))}
            </div>
          </section>

          {spec.controls.map((control) => (
            <ControlField
              key={control.key}
              control={control}
              value={values[control.key]}
              onChange={setValue}
            />
          ))}
        </aside>

        <main className={styles.preview} aria-label="Preview">
          <div className={styles.stage}>{spec.render(values)}</div>
        </main>
      </div>
    </div>
  );
}

/** One control, rendered by type: select becomes a chip group, boolean a switch. */
function ControlField({
  control,
  value,
  onChange,
}: {
  control: Control;
  value: string | boolean | undefined;
  onChange: (key: string, value: string | boolean) => void;
}) {
  if (control.type === "select") {
    return (
      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{control.label}</h2>
        <div className={styles.segments} role="radiogroup" aria-label={control.label}>
          {control.options.map((option) => (
            <label
              key={option}
              className={styles.segment}
              data-selected={value === option || undefined}
            >
              <input
                className={styles.srInput}
                type="radio"
                name={`bs-${control.key}`}
                value={option}
                checked={value === option}
                onChange={() => onChange(control.key, option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </section>
    );
  }

  if (control.type === "boolean") {
    return (
      <section className={styles.group}>
        <label className={styles.switchRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={Boolean(value)}
            onChange={(event) => onChange(control.key, event.target.checked)}
          />
          <span>{control.label}</span>
        </label>
      </section>
    );
  }

  return (
    <section className={styles.group}>
      <label className={styles.textRow}>
        <span className={styles.groupTitle}>{control.label}</span>
        <input
          type="text"
          className={styles.textInput}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(control.key, event.target.value)}
        />
      </label>
    </section>
  );
}

/** Local light/dark toggle (the marketing tree has no docs chrome). */
function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("sina-docs-theme", next);
    } catch {
      // Storage denied (private mode): the toggle still works for the session.
    }
    setDark(!dark);
  }

  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      data-broadsheet=""
      className={styles.themeToggle}
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <Icon weight="bold" aria-hidden="true" />
    </button>
  );
}
