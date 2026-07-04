import { Separator } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

export default function SeparatorStory() {
  return (
    <StoryShell title="Separator">
      <Demo label="Horizontal · between two blocks">
        <div className={styles.card}>
          <p className={styles.cardHeading}>First section</p>
          <Separator className={styles.rule} />
          <p className={styles.cardHeading}>Second section</p>
        </div>
      </Demo>

      <Demo label="Vertical · between inline items (flex-row, h-6)">
        <div className={styles.inlineRow}>
          <span>Edit</span>
          <Separator orientation="vertical" />
          <span>Duplicate</span>
          <Separator orientation="vertical" />
          <span>Delete</span>
        </div>
      </Demo>

      <Demo label="Semantic · decorative={false} exposes role=&quot;separator&quot;">
        <div className={styles.column}>
          <p className={styles.text}>Above the boundary</p>
          <Separator decorative={false} />
          <p className={styles.text}>Below the boundary</p>
          <p className={styles.caption}>
            With decorative=false the divider is a real section boundary for assistive tech.
          </p>
        </div>
      </Demo>
    </StoryShell>
  );
}
