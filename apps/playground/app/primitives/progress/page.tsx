import { Progress } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

const VALUES = [0, 25, 50, 75, 100] as const;

export default function ProgressStory() {
  return (
    <StoryShell title="Progress">
      <Demo label="Determinate · 0 → 100">
        <div className={styles.stack}>
          {VALUES.map((value) => (
            <div key={value} className={styles.row}>
              <span className={styles.valueLabel}>{value}</span>
              <div className={styles.track}>
                <Progress value={value} label={`Progress ${value} percent`} />
              </div>
            </div>
          ))}
        </div>
      </Demo>

      <Demo label="Indeterminate · no value">
        <div className={styles.track}>
          <Progress label="Loading" />
        </div>
      </Demo>
    </StoryShell>
  );
}
