"use client";

import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import styles from "./Tabs.module.css";

/**
 * Accessible tabs (package-manager switch, framework switch, Preview/Code).
 * Author as `<Tabs><Tab label="pnpm">…</Tab><Tab label="npm">…</Tab></Tabs>`.
 * WAI-ARIA tabs pattern: roving arrow-key focus, `aria-selected`, linked panels.
 */

export function Tab({ children }: { label: string; children: ReactNode }) {
  // Marker component — Tabs reads `label` via props; this render is unused.
  return <>{children}</>;
}

export function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<{
    label: string;
    children: ReactNode;
  }>[];
  const [active, setActive] = useState(0);
  const base = useId();
  const btns = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = tabs.length - 1;
    let next = active;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setActive(next);
    btns.current[next]?.focus();
  }

  return (
    <div className={styles.tabs}>
      <div className={styles.tablist} role="tablist" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.props.label}
            ref={(el) => {
              btns.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(i)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.props.label}
          role="tabpanel"
          id={`${base}-panel-${i}`}
          aria-labelledby={`${base}-tab-${i}`}
          hidden={i !== active}
          className={styles.panel}
        >
          {tab.props.children}
        </div>
      ))}
    </div>
  );
}
