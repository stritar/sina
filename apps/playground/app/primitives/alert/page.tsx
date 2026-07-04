import { Alert } from "@sina-design-system/core";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

const VARIANTS = [
  { variant: "info", title: "Heads up", body: "Informational context for the current step." },
  { variant: "success", title: "All set", body: "The action completed successfully." },
  { variant: "warning", title: "Requires review", body: "Take a second look before proceeding." },
  { variant: "danger", title: "Blocked", body: "This was stopped and announced assertively." },
] as const;

export default function AlertStory() {
  return (
    <StoryShell title="Alert">
      <Demo label="Variants · icon + title + description, never color alone">
        <div className={styles.stack}>
          {VARIANTS.map((v) => (
            <Alert key={v.variant} variant={v.variant} title={v.title}>
              {v.body}
            </Alert>
          ))}
        </div>
      </Demo>

      <Demo label="Icon override · custom glyph / hidden (icon={false})">
        <div className={styles.stack}>
          <Alert variant="info" title="Custom icon" icon={Sparkle}>
            Pass a Phosphor glyph to override the default intent icon.
          </Alert>
          <Alert variant="info" title="No icon" icon={false}>
            Pass icon={"{false}"} to omit the leading glyph entirely.
          </Alert>
        </div>
      </Demo>

      <Demo label="Content shapes · title-only / description-only">
        <div className={styles.stack}>
          <Alert variant="success" title="Title only" />
          <Alert variant="warning">Description only, with no heading line.</Alert>
        </div>
      </Demo>
    </StoryShell>
  );
}
