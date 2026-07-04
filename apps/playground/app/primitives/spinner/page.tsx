import { Spinner } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

const SIZES = ["sm", "md", "lg"] as const;

export default function SpinnerStory() {
  return (
    <StoryShell title="Spinner">
      <Demo label="Sizes · sm / md / lg">
        <div className={styles.column}>
          <div className={styles.row}>
            {SIZES.map((size) => (
              <Spinner key={size} size={size} label={`Loading (${size})`} />
            ))}
          </div>
          <p className={styles.caption}>
            `label` is screen-reader-only — announced via role=&quot;status&quot;, never shown.
          </p>
        </div>
      </Demo>
    </StoryShell>
  );
}
