import { CredentialField, CredentialOTP } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function CredentialFieldStory() {
  return (
    <StoryShell title="CredentialField">
      <Demo label="masked + reveal toggle">
        <CredentialField className="w-64" label="Approval code" placeholder="Enter code" />
      </Demo>
      <Demo label="filled">
        <CredentialField className="w-64" label="Approval code" defaultValue="8F2K9Q" />
      </Demo>
      <Demo label="error">
        <CredentialField
          className="w-64"
          label="Approval code"
          error="That code is incorrect."
          defaultValue="000000"
        />
      </Demo>
      <Demo label="disabled">
        <CredentialField className="w-64" label="Approval code" disabled defaultValue="8F2K9Q" />
      </Demo>
      <Demo label="segmented · one-time code">
        <CredentialOTP length={6} defaultValue="429" aria-label="Approval code" />
      </Demo>
    </StoryShell>
  );
}
