import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Diagrams.module.css";

/**
 * The docs diagram set — built from real text + CSS (not baked images) so they
 * are accessible, theme-aware, and Cloudflare-static-safe. Decorative arrows are
 * `aria-hidden`; the labels carry the meaning.
 */

function Arrow({ vertical = false }: { vertical?: boolean }) {
  return (
    <span className={cx(styles.arrow, vertical && styles.arrowV)} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d={vertical ? "M12 4v16M6 14l6 6 6-6" : "M4 12h16M14 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * The interception seam — intent → schema → policy → decision → block | mount.
 * The hero diagram. `highlight` emphasises one outcome (used on the wire page).
 */
export function FlowDiagram({ highlight }: { highlight?: "block" | "mount" }) {
  return (
    <figure className={styles.figure}>
      <div className={styles.flow}>
        <div className={styles.node}>
          <span className={styles.nodeKicker}>Model proposes</span>
          <span className={styles.nodeTitle}>Intent</span>
          <span className={styles.nodeSub}>a verb + props</span>
        </div>
        <Arrow />
        <div className={cx(styles.node, styles.gate)}>
          <span className={styles.nodeKicker}>Server decides</span>
          <span className={styles.nodeTitle}>The gate</span>
          <span className={styles.nodeSub}>schema → policy → decision</span>
        </div>
        <Arrow />
        <div className={styles.branch}>
          <div
            className={cx(
              styles.outcome,
              styles.block,
              highlight && highlight !== "block" && styles.dim,
            )}
          >
            Blocked — nothing unsafe mounts
          </div>
          <div
            className={cx(
              styles.outcome,
              styles.mount,
              highlight && highlight !== "mount" && styles.dim,
            )}
          >
            Mounts a governed primitive
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>
        The model proposes; the server decides; the client only renders what passed.
      </figcaption>
    </figure>
  );
}

/** The three layers, stacked, with the one-directional import rule. */
export function ArchitectureDiagram() {
  const layers = [
    { name: "theme", role: "Design tokens — the --sina-* variables. No React." },
    { name: "core", role: "Accessible primitives on Radix. Domain-agnostic." },
    { name: "fintech · fintech-react", role: "The Constitution + the governed components." },
  ];
  return (
    <figure className={styles.figure}>
      <div className={styles.stack}>
        {layers.map((l, i) => (
          <div key={l.name} className={styles.layer}>
            <code className={styles.layerName}>{l.name}</code>
            <span className={styles.layerRole}>{l.role}</span>
            {i < layers.length - 1 ? <Arrow vertical /> : null}
          </div>
        ))}
      </div>
      <figcaption className={styles.caption}>
        Each layer may use the one below it — never the reverse. The linter enforces it.
      </figcaption>
    </figure>
  );
}

/** The three severities as a ladder: what a failure does at each level. */
export function EnforcementLadder() {
  const rungs = [
    { key: "flag", label: "flag", what: "Informational. Logged on the decision; nothing is blocked." },
    { key: "escalate", label: "escalate", what: "The standard render is blocked; a stricter governed component is forced instead." },
    { key: "reject", label: "reject", what: "Hard block. Nothing mounts — the request is refused outright." },
  ];
  return (
    <figure className={styles.figure}>
      <div className={styles.ladder}>
        {rungs.map((r) => (
          <div key={r.key} className={cx(styles.rung, styles[r.key])}>
            <code className={styles.rungLabel}>{r.label}</code>
            <span className={styles.rungWhat}>{r.what}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

/** One value flowing through the three token tiers. */
export function TokenTree() {
  return (
    <figure className={styles.figure}>
      <div className={styles.tree}>
        <div className={styles.tier}>
          <span className={styles.tierKicker}>Primitive value</span>
          <code className={styles.tierValue}>#4a5a3f</code>
          <span className={styles.tierNote}>a raw hex in theme.css</span>
        </div>
        <Arrow />
        <div className={styles.tier}>
          <span className={styles.tierKicker}>Semantic role</span>
          <code className={styles.tierValue}>--sina-color-primary</code>
          <span className={styles.tierNote}>what it means</span>
        </div>
        <Arrow />
        <div className={styles.tier}>
          <span className={styles.tierKicker}>Component token</span>
          <code className={styles.tierValue}>--sina-button-bg</code>
          <span className={styles.tierNote}>where it&rsquo;s used</span>
        </div>
      </div>
      <figcaption className={styles.caption}>
        Change the value once; every component that points at the role updates.
      </figcaption>
    </figure>
  );
}

/** Numbered anatomy legend beside the composed-parts code (passed as children). */
export function PrimitiveAnatomy({
  parts,
  children,
}: {
  parts: Array<{ label: string; description: string }>;
  children: ReactNode;
}) {
  return (
    <figure className={cx(styles.figure, styles.anatomy)}>
      <ol className={styles.parts}>
        {parts.map((p) => (
          <li key={p.label} className={styles.part}>
            <span className={styles.partLabel}>{p.label}</span>
            <span className={styles.partDesc}>{p.description}</span>
          </li>
        ))}
      </ol>
      <div className={styles.anatomyCode}>{children}</div>
    </figure>
  );
}

/** Before / after comparison (ungoverned vs governed, over-broad vs focused). */
export function BeforeAfter({ children }: { children: ReactNode }) {
  return <div className={styles.beforeAfter}>{children}</div>;
}

export function Before({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={cx(styles.ba, styles.baBefore)}>
      <p className={styles.baTitle}>{title}</p>
      <div className={styles.baBody}>{children}</div>
    </div>
  );
}

export function After({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={cx(styles.ba, styles.baAfter)}>
      <p className={styles.baTitle}>{title}</p>
      <div className={styles.baBody}>{children}</div>
    </div>
  );
}
