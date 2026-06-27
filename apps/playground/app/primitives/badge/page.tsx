import { Badge } from "@sina-design-system/core";
import { CheckCircle, Clock, Info, Lock, X } from "@phosphor-icons/react/dist/ssr";
import { Demo, StoryShell } from "../_components/StoryShell";

const INTENTS = [
  { intent: "danger", label: "Blocked", icon: X },
  { intent: "success", label: "Compliant", icon: CheckCircle },
  { intent: "warning", label: "Approval", icon: Lock },
  { intent: "info", label: "Pending", icon: Clock },
  { intent: "neutral", label: "Draft", icon: Info },
] as const;

export default function BadgeStory() {
  return (
    <StoryShell title="Badge">
      <Demo label="subtle">
        {INTENTS.map((i) => (
          <Badge key={i.intent} appearance="subtle" intent={i.intent}>
            {i.label}
          </Badge>
        ))}
      </Demo>
      <Demo label="solid">
        {INTENTS.map((i) => (
          <Badge key={i.intent} appearance="solid" intent={i.intent}>
            {i.label}
          </Badge>
        ))}
      </Demo>
      <Demo label="dot">
        {INTENTS.map((i) => (
          <Badge key={i.intent} intent={i.intent} dot>
            {i.label}
          </Badge>
        ))}
      </Demo>
      <Demo label="icon">
        {INTENTS.map((i) => (
          <Badge key={i.intent} intent={i.intent} icon={i.icon}>
            {i.label}
          </Badge>
        ))}
      </Demo>
      <Demo label="sizes · sm / md">
        <Badge size="sm" intent="warning" icon={Lock}>
          Requires approval
        </Badge>
        <Badge size="md" intent="warning" icon={Lock}>
          Requires approval
        </Badge>
      </Demo>
    </StoryShell>
  );
}
