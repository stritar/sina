import { CurrencyField } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function CurrencyFieldStory() {
  return (
    <StoryShell title="CurrencyField">
      <Demo label="Formatted numeric entry (groups on blur — display only)">
        <div className="w-full max-w-xs">
          <CurrencyField
            label="Transfer amount"
            description="Whole dollars"
            defaultValue="25000"
          />
        </div>
      </Demo>
      <Demo label="Error state">
        <div className="w-full max-w-xs">
          <CurrencyField label="Amount" required error="Enter an amount" />
        </div>
      </Demo>
    </StoryShell>
  );
}
