import { TextField } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

export default function TextFieldStory() {
  return (
    <StoryShell title="TextField">
      <Demo label="States">
        <div className={styles.field}>
          <TextField label="Recipient name" />
        </div>
        <div className={styles.field}>
          <TextField label="Recipient name" description="As it appears on the account." />
        </div>
        <div className={styles.field}>
          <TextField label="Recipient name" error="Recipient is required." />
        </div>
        <div className={styles.field}>
          <TextField label="Recipient name" disabled defaultValue="Acme Payroll" />
        </div>
        <div className={styles.field}>
          <TextField label="Recipient name" required />
        </div>
        <div className={styles.field}>
          <TextField label="Recipient name" placeholder="Acme Payroll" />
        </div>
        <div className={styles.field}>
          <TextField label="Recipient name" defaultValue="Acme Payroll" />
        </div>
      </Demo>

      <Demo label="Multiline">
        <div className={styles.field}>
          <TextField label="Memo" multiline placeholder="Add a memo (optional)" />
        </div>
        <div className={styles.field}>
          <TextField label="Memo" multiline rows={6} placeholder="Add a longer memo" />
        </div>
      </Demo>
    </StoryShell>
  );
}
