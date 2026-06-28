"use client";

import { Badge, type BadgeProps } from "@sina-design-system/core";
import { CheckCircle, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Demo, Matrix, StoryShell } from "../_components/StoryShell";

const APPEARANCES = ["subtle", "solid"] as const;
const INTENTS = ["danger", "success", "warning", "info", "neutral"] as const;

export default function BadgeStory() {
  return (
    <StoryShell title="Badge">
      <Matrix
        label="appearance × intent · size md"
        rows={APPEARANCES.map((a) => ({ key: a, label: a }))}
        cols={INTENTS.map((i) => ({ key: i, label: i }))}
        render={(appearance, intent) => (
          <Badge
            appearance={appearance as BadgeProps["appearance"]}
            intent={intent as BadgeProps["intent"]}
            size="md"
          >
            {intent}
          </Badge>
        )}
      />

      <Matrix
        label="appearance × intent · size sm"
        rows={APPEARANCES.map((a) => ({ key: a, label: a }))}
        cols={INTENTS.map((i) => ({ key: i, label: i }))}
        render={(appearance, intent) => (
          <Badge
            appearance={appearance as BadgeProps["appearance"]}
            intent={intent as BadgeProps["intent"]}
            size="sm"
          >
            {intent}
          </Badge>
        )}
      />

      <Demo label="Modifiers · dot / icon / dot+solid / icon+solid">
        <Badge intent="success" dot>
          Dot
        </Badge>
        <Badge intent="info" icon={ShieldCheck}>
          Icon
        </Badge>
        <Badge appearance="solid" intent="success" dot>
          Dot solid
        </Badge>
        <Badge appearance="solid" intent="info" icon={ShieldCheck}>
          Icon solid
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
