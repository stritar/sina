import { Badge, SummaryList } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function SummaryListStory() {
  return (
    <StoryShell title="SummaryList">
      <Demo label="default">
        <SummaryList
          className="w-80"
          items={[
            { label: "From", value: "Checking · 4029" },
            { label: "To", value: "Acme Payroll · 8810" },
            { label: "Amount", value: "$4,250.00" },
            { label: "Fee", value: "$0.00" },
          ]}
        />
      </Demo>
      <Demo label="emphasized total">
        <SummaryList
          className="w-80"
          items={[
            { label: "Amount", value: "$4,250.00" },
            { label: "Fee", value: "$0.00" },
            { label: "Total", value: "$4,250.00", emphasis: true },
          ]}
        />
      </Demo>
      <Demo label="with badge value">
        <SummaryList
          className="w-80"
          items={[
            { label: "Recipient", value: "Acme Payroll" },
            { label: "Status", value: <Badge intent="success">Compliant</Badge> },
            { label: "Amount", value: "$4,250.00" },
          ]}
        />
      </Demo>
    </StoryShell>
  );
}
