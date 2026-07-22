import { Checkbox } from "@sina-design-system/core";
import { Demo, Specimen, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

// Static focus ring, mirroring the house focus style (`:focus-visible` only) so
// the "focus" specimen reads as focused without keyboard interaction.
const focusRing = styles.focusRing;

export default function CheckboxStory() {
  return (
    <StoryShell title="Checkbox">
      <Demo label="States">
        <Checkbox aria-label="unchecked" />
        <Checkbox aria-label="checked" defaultChecked />
        <Checkbox aria-label="indeterminate" checked="indeterminate" />
      </Demo>

      <Demo label="Focus / disabled">
        <div className={styles.row}>
          <Specimen caption="focus">
            <Checkbox aria-label="focus" defaultChecked className={focusRing} />
          </Specimen>
          <Specimen caption="disabled">
            <Checkbox aria-label="disabled" defaultChecked disabled />
          </Specimen>
        </div>
      </Demo>

      <Demo label="With label">
        <div className={styles.rowWide}>
          <Specimen caption="checked + label">
            <Checkbox label="Accept terms" defaultChecked />
          </Specimen>
          <Specimen caption="unchecked + label">
            <Checkbox label="Subscribe" />
          </Specimen>
        </div>
      </Demo>
    </StoryShell>
  );
}
