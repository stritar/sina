"use client";

import { Badge, type BadgeProps } from "@sina-design-system/core";
import { CheckCircle, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Demo, Matrix, StoryShell } from "../_components/StoryShell";

const SIZES = ["md", "sm"] as const;
const INTENTS = ["danger", "success", "warning", "info", "neutral"] as const;

export default function BadgeStory() {
  return (
    <StoryShell title="Badge">
      <Matrix
        label="size × intent"
        rows={SIZES.map((s) => ({ key: s, label: s }))}
        cols={INTENTS.map((i) => ({ key: i, label: i }))}
        render={(size, intent) => (
          <Badge
            size={size as BadgeProps["size"]}
            intent={intent as BadgeProps["intent"]}
          >
            {intent}
          </Badge>
        )}
      />

      <Demo label="Mandatory glyph · danger / warning render a filled icon by default">
        <Badge intent="danger">Blocked</Badge>
        <Badge intent="warning">Review</Badge>
      </Demo>

      <Demo label="Modifiers · dot / icon / dot sm">
        <Badge intent="success" dot>
          Dot
        </Badge>
        <Badge intent="info" icon={ShieldCheck}>
          Icon
        </Badge>
        <Badge size="sm" intent="success" dot>
          Dot sm
        </Badge>
      </Demo>

      <Demo label="Dismissible · trailing X via onClose + closeLabel">
        {INTENTS.map((intent) => (
          <Badge
            key={intent}
            intent={intent}
            icon={CheckCircle}
            onClose={() => {}}
            closeLabel={`Dismiss ${intent}`}
          >
            {intent}
          </Badge>
        ))}
      </Demo>
    </StoryShell>
  );
}
