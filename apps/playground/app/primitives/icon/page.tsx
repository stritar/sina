import { Icon } from "@sina-design-system/core";
import { Lock, ShieldCheck, TriangleAlert } from "lucide-react";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function IconStory() {
  return (
    <StoryShell title="Icon">
      <Demo label="Labeled (announced to assistive tech)">
        <span className="text-text">
          <Icon icon={ShieldCheck} label="Secure" size={24} />
        </span>
        <span className="text-danger">
          <Icon icon={TriangleAlert} label="Warning" size={24} />
        </span>
      </Demo>
      <Demo label="Decorative (hidden from assistive tech), color via currentColor">
        <span className="text-text-muted">
          <Icon icon={Lock} decorative size={24} />
        </span>
        <span className="text-success">
          <Icon icon={Lock} decorative size={24} />
        </span>
      </Demo>
    </StoryShell>
  );
}
