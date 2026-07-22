import { ScrollArea } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

export default function ScrollAreaStory() {
  return (
    <StoryShell title="ScrollArea">
      <Demo label="Vertical">
        <ScrollArea className={[styles.viewport, styles.tall].join(" ")}>
          <div className={styles.colStack}>
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className={styles.rowItem}
              >
                Row {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Demo>

      <Demo label="Horizontal">
        <ScrollArea className={[styles.viewport, styles.short].join(" ")}>
          <div className={styles.rowMax}>
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className={styles.chip}
              >
                Chip {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Demo>

      <Demo label="Both axes (corner)">
        <ScrollArea className={[styles.viewport, styles.tall].join(" ")}>
          <div className={styles.colMax}>
            {Array.from({ length: 20 }, (_, r) => (
              <div key={r} className={styles.rowMax}>
                {Array.from({ length: 12 }, (_, c) => (
                  <div
                    key={c}
                    className={styles.cell}
                  >
                    {r + 1}·{c + 1}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Demo>
    </StoryShell>
  );
}
