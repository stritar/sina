import { CurrencyField } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";
import styles from "./page.module.css";

export default function CurrencyFieldStory() {
  return (
    <StoryShell title="CurrencyField">
      <Demo label="Symbols">
        <div className={styles.field}>
          <CurrencyField label="Amount" currencySymbol="$" defaultValue="25000" />
        </div>
        <div className={styles.field}>
          <CurrencyField label="Amount" currencySymbol="€" defaultValue="25000" />
        </div>
        <div className={styles.field}>
          <CurrencyField label="Amount" currencySymbol="£" defaultValue="25000" />
        </div>
        <div className={styles.field}>
          <CurrencyField label="Amount" currencySymbol="¥" defaultValue="25000" />
        </div>
      </Demo>

      <Demo label="States">
        <div className={styles.field}>
          <CurrencyField label="Amount" />
        </div>
        <div className={styles.field}>
          <CurrencyField label="Amount" defaultValue="25000" />
        </div>
        <div className={styles.field}>
          <CurrencyField label="Amount" description="Whole units" defaultValue="25000" />
        </div>
        <div className={styles.field}>
          <CurrencyField label="Amount" error="Enter an amount" />
        </div>
        <div className={styles.field}>
          <CurrencyField label="Amount" disabled defaultValue="25000" />
        </div>
        <div className={styles.field}>
          <CurrencyField label="Amount" required />
        </div>
      </Demo>
    </StoryShell>
  );
}
