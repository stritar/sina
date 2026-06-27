import { ScrollArea, SummaryList } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function ScrollAreaStory() {
  return (
    <StoryShell title="ScrollArea">
      <Demo label="fixed body · overflow scrolls">
        <ScrollArea className="h-44 w-80 rounded-lg border border-border bg-surface px-4">
          <SummaryList
            items={[
              { label: "Initiated", value: "Jun 27 · 09:14" },
              { label: "From", value: "Operating · 1180" },
              { label: "To", value: "New vendor · 6624" },
              { label: "Amount", value: "$50,000.00" },
              { label: "Fee", value: "$30.00" },
              { label: "Method", value: "Wire · instant" },
              { label: "Reference", value: "INV-20269-Q" },
              { label: "Approver", value: "—" },
              { label: "Status", value: "Pending approval" },
            ]}
          />
        </ScrollArea>
      </Demo>
    </StoryShell>
  );
}
