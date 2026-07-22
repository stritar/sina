import { Field } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

const inputClassName = [styles.control, styles.input].join(" ");
const textareaClassName = [styles.control, styles.textarea].join(" ");

export default function FieldStory() {
  return (
    <StoryShell title="Field">
      <Demo label="Label only">
        <div className={styles.fieldWrap}>
          <Field label="Recipient">
            <input className={inputClassName} placeholder="Jane Doe" />
          </Field>
        </div>
      </Demo>

      <Demo label="Description">
        <div className={styles.fieldWrap}>
          <Field label="Recipient" description="Full legal name on the account">
            <input className={inputClassName} placeholder="Jane Doe" />
          </Field>
        </div>
      </Demo>

      <Demo label="Error (announced, aria-invalid wired)">
        <div className={styles.fieldWrap}>
          <Field label="Reference" error="This field is required">
            <input className={inputClassName} />
          </Field>
        </div>
      </Demo>

      <Demo label="Required">
        <div className={styles.fieldWrap}>
          <Field label="Reference" required>
            <input className={inputClassName} />
          </Field>
        </div>
      </Demo>

      <Demo label="Control types (a11y wiring clones onto any control)">
        <div className={styles.fieldWrap}>
          <Field label="Region" description="Pick one">
            <select className={inputClassName}>
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
            </select>
          </Field>
        </div>
        <div className={styles.fieldWrap}>
          <Field label="Notes" description="Free-form text">
            <textarea
              rows={3}
              className={textareaClassName}
              placeholder="Add a note"
            />
          </Field>
        </div>
        <div className={styles.fieldWrap}>
          <Field label="Quantity" description="Whole units" required>
            <input type="number" className={inputClassName} placeholder="0" />
          </Field>
        </div>
      </Demo>
    </StoryShell>
  );
}
