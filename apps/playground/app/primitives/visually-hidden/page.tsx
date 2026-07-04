import { VisuallyHidden } from "@sina-design-system/core";
import { X } from "@phosphor-icons/react/dist/ssr";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

export default function VisuallyHiddenStory() {
  return (
    <StoryShell title="VisuallyHidden">
      <Demo label="Icon-only button (name from hidden text)">
        <button
          type="button"
          className={styles.iconButton}
        >
          <X aria-hidden className={styles.glyph} />
          <VisuallyHidden>Close</VisuallyHidden>
        </button>
        <p className={styles.note}>
          The glyph is the only visible content; the accessible name comes from the
          hidden “Close” text, so screen readers announce a labeled button.
        </p>
      </Demo>

      <Demo label="Standalone SR text (announced, not shown)">
        <div className={styles.column}>
          <p className={styles.textSm}>
            Step 2 of 4
            <VisuallyHidden> — Account details</VisuallyHidden>
          </p>
          <p className={styles.caption}>
            Sighted users see only “Step 2 of 4”. Screen readers also announce the
            hidden “Account details” context, giving extra clarity without changing
            the visual layout.
          </p>
        </div>
      </Demo>
    </StoryShell>
  );
}
