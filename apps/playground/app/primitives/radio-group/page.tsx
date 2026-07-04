import { RadioGroup, RadioGroupItem } from "@sina-design-system/core";
import { Demo, Specimen, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

export default function RadioGroupStory() {
  return (
    <StoryShell title="RadioGroup">
      <Demo label="States">
        <div className={styles.rowCenter}>
          <RadioGroup aria-label="unchecked">
            <RadioGroupItem value="off" aria-label="unchecked" />
          </RadioGroup>
          <RadioGroup defaultValue="on" aria-label="checked">
            <RadioGroupItem value="on" aria-label="checked" />
          </RadioGroup>
        </div>
      </Demo>

      <Demo label="Focus / disabled">
        <div className={styles.rowStart}>
          <Specimen caption="focus">
            <RadioGroup defaultValue="on" aria-label="focus">
              <RadioGroupItem value="on" aria-label="focus" className={styles.focusRing} />
            </RadioGroup>
          </Specimen>
          <Specimen caption="disabled">
            <RadioGroup defaultValue="on" aria-label="disabled">
              <RadioGroupItem value="on" aria-label="disabled" disabled />
            </RadioGroup>
          </Specimen>
        </div>
      </Demo>

      <Demo label="Group + labels">
        <Specimen caption="group + labels">
          <RadioGroup defaultValue="standard" aria-label="Priority level">
            <RadioGroupItem value="standard" label="Standard" />
            <RadioGroupItem value="priority" label="Priority" />
          </RadioGroup>
        </Specimen>
      </Demo>
    </StoryShell>
  );
}
