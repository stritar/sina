import type { ReactNode } from "react";
import { cx } from "./cx";
import { Glyph } from "./Glyph";
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
 * A pipeline step — the arrow travels with the chip it points at, so a wrap in a
 * narrow column never orphans an arrow at the end of a line.
 */
function Step({ arrow = false, children }: { arrow?: boolean; children: ReactNode }) {
  return (
    <span className={styles.pipeStep}>
      {arrow ? (
        <span className={styles.chipArrow} aria-hidden="true">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path
              d="M1 5h11M8.5 1.5 12.5 5l-4 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : null}
      {children}
    </span>
  );
}

/** The fake browser both panels render inside — chrome bar + a mock screen. */
function Browser({ children }: { children: ReactNode }) {
  return (
    <div className={styles.browser}>
      <div className={styles.browserBar}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.browserUrl}>yourapp.com</span>
      </div>
      <div className={styles.browserScreen}>{children}</div>
    </div>
  );
}

/**
 * The hero diagram — the same model and the same request, with and without the
 * gate. The left screen is whatever the model wrote; the right one is what the
 * constitution allowed to render.
 */
export function SameModelDiagram() {
  return (
    <figure className={styles.figure}>
      <div className={styles.compare}>
        <div className={cx(styles.panel, styles.panelUngoverned)}>
          <span className={styles.panelTitle}>
            <Glyph name="warning" size={16} />
            Without governance
          </span>
          <span className={styles.pipeline}>
            <Step>
              <span className={styles.chip}>model</span>
            </Step>
            <Step arrow>
              <span className={cx(styles.chip, styles.chipMono)}>raw UI code</span>
            </Step>
          </span>
          <Browser>
            <span className={cx(styles.pushButton, styles.pushButtonDanger)}>Confirm $60,000</span>
            <span className={styles.screenNote}>fabricated by the model — rendered as-is</span>
          </Browser>
          <span className={styles.panelFoot}>Whatever the model writes, the user sees.</span>
        </div>

        <div className={cx(styles.panel, styles.panelGoverned)}>
          <span className={styles.panelTitle}>
            <Glyph name="check" size={16} />
            With SINA
          </span>
          <span className={styles.pipeline}>
            <Step>
              <span className={styles.chip}>model</span>
            </Step>
            <Step arrow>
              <span className={cx(styles.chip, styles.chipMono)}>intent · data</span>
            </Step>
            <Step arrow>
              <span className={cx(styles.chip, styles.chipGate)}>constitution</span>
            </Step>
          </span>
          <Browser>
            <div className={styles.dialog}>
              <span className={styles.dialogTitle}>
                <Glyph name="shield" size={15} />
                Second approval required
              </span>
              <span className={styles.dialogTerms}>$60,000 wire · vendor payout</span>
              <span className={styles.dialogViolation}>
                <Glyph name="warning" size={13} />
                over the $25,000 limit
              </span>
              <span className={styles.dialogActions}>
                <span className={cx(styles.pushButton, styles.pushButtonPrimary)}>
                  Request approval
                </span>
                <span className={cx(styles.pushButton, styles.pushButtonQuiet)}>Cancel</span>
              </span>
            </div>
          </Browser>
          <span className={styles.panelFoot}>Whatever passes your rules, the user sees.</span>
        </div>
      </div>
      <figcaption className={styles.caption}>
        Same model, same request — the difference is what&rsquo;s allowed to render.
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
