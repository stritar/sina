import { Badge, SummaryList } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function SummaryListStory() {
  return (
    <StoryShell title="SummaryList">
      <Demo label="Key/value rows">
        <SummaryList
          className="w-full"
          items={[
            { label: "Name", value: "Project Atlas" },
            { label: "Owner", value: "Platform team" },
            { label: "Created", value: "Jun 27 · 09:14" },
            { label: "Region", value: "North" },
          ]}
        />
      </Demo>

      <Demo label="Emphasis">
        <SummaryList
          className="w-full"
          items={[
            { label: "Subtotal", value: "120 units" },
            { label: "Adjustment", value: "4 units" },
            { label: "Total", value: "124 units", emphasis: true },
          ]}
        />
      </Demo>

      <Demo label="Rich values">
        <SummaryList
          className="w-full"
          items={[
            { label: "Owner", value: "Platform team" },
            { label: "Status", value: <Badge intent="success">Active</Badge> },
            {
              label: "Notes",
              value:
                "A longer descriptive value that exceeds the available width and wraps onto multiple lines within the row.",
            },
          ]}
        />
      </Demo>

      <Demo label="Multiple emphasis">
        <SummaryList
          className="w-full"
          items={[
            { label: "Phase one", value: "Complete", emphasis: true },
            { label: "Phase two", value: "In progress" },
            { label: "Phase three", value: "Queued" },
            { label: "Overall", value: "On track", emphasis: true },
          ]}
        />
      </Demo>
    </StoryShell>
  );
}
