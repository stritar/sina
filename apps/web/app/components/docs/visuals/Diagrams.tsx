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
          <span className={styles.nodeKicker}>The AI asks</span>
          <span className={styles.nodeTitle}>&ldquo;Show a transfer&rdquo;</span>
          <span className={styles.nodeSub}>a goal + data — never UI code</span>
        </div>
        <Arrow />
        <div className={cx(styles.node, styles.gate)}>
          <span className={styles.nodeKicker}>Your server checks</span>
          <span className={styles.nodeTitle}>The rules run</span>
          <span className={styles.nodeSub}>right shape? within your limits?</span>
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
            $60,000 — over your limit: blocked, a second-approver dialog renders instead
          </div>
          <div
            className={cx(
              styles.outcome,
              styles.mount,
              highlight && highlight !== "mount" && styles.dim,
            )}
          >
            $500 — passes every rule: the real, accessible component renders
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>
        The AI proposes; your server decides; the screen only shows what passed.
      </figcaption>
    </figure>
  );
}

/** The three layers, stacked, with the one-directional import rule. */
export function ArchitectureDiagram() {
  const layers = [
    { name: "theme", role: "The look — colors, spacing, type, as design tokens. No React." },
    { name: "core", role: "The parts — accessible buttons, dialogs, forms. No domain rules." },
    { name: "fintech · fintech-react", role: "The rules — and the stricter components they can force." },
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
    { key: "flag", label: "flag", what: "Noted, not blocked — a $5,000 transfer is logged for review and still goes through." },
    { key: "escalate", label: "escalate", what: "Redirected to a safer path — a $60,000 wire gets a second-approver dialog instead of a confirm button." },
    { key: "reject", label: "reject", what: "Refused outright — a fabricated “Confirm” button simply never renders." },
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
