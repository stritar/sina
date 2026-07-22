import { CredentialField, CredentialOTP } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

export default function CredentialFieldStory() {
  return (
    <StoryShell title="CredentialField">
      <Demo label="CredentialField · masked + reveal toggle">
        <div className={styles.field}>
          <CredentialField label="Approval code" placeholder="Enter code" />
        </div>
        <div className={styles.field}>
          <CredentialField label="Approval code" defaultValue="8F2K9Q" />
        </div>
        <div className={styles.field}>
          <CredentialField
            label="Approval code"
            error="That code is incorrect."
            defaultValue="000000"
          />
        </div>
        <div className={styles.field}>
          <CredentialField label="Approval code" disabled defaultValue="8F2K9Q" />
        </div>
        <div className={styles.field}>
          <CredentialField label="Approval code" required placeholder="Enter code" />
        </div>
      </Demo>

      <Demo label="CredentialOTP · length variants">
        <CredentialOTP length={4} aria-label="Four-digit code" />
        <CredentialOTP length={6} aria-label="Six-digit code" />
        <CredentialOTP length={8} aria-label="Eight-digit code" />
      </Demo>

      <Demo label="CredentialOTP · states">
        <CredentialOTP length={6} defaultValue="123456" aria-label="Filled code" />
        <CredentialOTP length={6} defaultValue="123" aria-label="Partially filled code" />
        <CredentialOTP length={6} defaultValue="123456" invalid aria-label="Invalid code" />
        <CredentialOTP length={6} defaultValue="123456" disabled aria-label="Disabled code" />
      </Demo>
    </StoryShell>
  );
}
