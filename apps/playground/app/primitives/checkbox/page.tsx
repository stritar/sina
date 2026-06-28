import { Checkbox } from "@sina-design-system/core";
import { Demo, Matrix, StoryShell } from "../_components/StoryShell";

export default function CheckboxStory() {
  return (
    <StoryShell title="Checkbox">
      <Demo label="States">
        <Checkbox aria-label="unchecked" />
        <Checkbox aria-label="checked" defaultChecked />
        <Checkbox aria-label="indeterminate" checked="indeterminate" />
        <Checkbox aria-label="disabled" disabled />
        <Checkbox aria-label="disabled checked" disabled defaultChecked />
      </Demo>

      <Demo label="With label">
        <Checkbox label="I acknowledge this action" />
        <Checkbox label="I acknowledge this action" defaultChecked />
        <Checkbox label="I acknowledge this action" disabled />
      </Demo>

      <Matrix
        label="State × label"
        rows={[
          { key: "unchecked", label: "unchecked" },
          { key: "checked", label: "checked" },
          { key: "indeterminate", label: "indeterminate" },
          { key: "disabled", label: "disabled" },
        ]}
        cols={[
          { key: "no-label", label: "no label" },
          { key: "with-label", label: "with label" },
        ]}
        render={(row, col) => {
          const withLabel = col === "with-label";
          const labelProps = withLabel
            ? { label: "Acknowledge" }
            : { "aria-label": `${row} checkbox` };

          if (row === "checked") return <Checkbox defaultChecked {...labelProps} />;
          if (row === "indeterminate") return <Checkbox checked="indeterminate" {...labelProps} />;
          if (row === "disabled") return <Checkbox disabled {...labelProps} />;
          return <Checkbox {...labelProps} />;
        }}
      />
    </StoryShell>
  );
}
