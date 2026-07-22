"use client";

import { CredentialField, CredentialOTP } from "@sina-design-system/core";
import { Example, Hero, StorySource } from "../shell";

/**
 * Live CredentialField demos for /docs/primitives/credential-field. Ported
 * from the playground story
 * (apps/playground/app/primitives/credential-field/page.tsx) — keep the two in
 * step when the primitive's prop surface changes.
 */

export function CredentialFieldHero() {
  return (
    <Hero>
      <CredentialField label="Approval code" defaultValue="8F2K9Q" />
      <CredentialOTP length={6} defaultValue="123456" aria-label="Six-digit code" />
    </Hero>
  );
}

export function CredentialFieldExamples() {
  return (
    <>
      <Example
        label="CredentialField · masked + reveal toggle"
        code={`<CredentialField label="Approval code" placeholder="Enter code" />
<CredentialField label="Approval code" defaultValue="8F2K9Q" />
<CredentialField label="Approval code" error="That code is incorrect." defaultValue="000000" />
<CredentialField label="Approval code" disabled defaultValue="8F2K9Q" />
<CredentialField label="Approval code" required placeholder="Enter code" />`}
      >
        <CredentialField label="Approval code" placeholder="Enter code" />
        <CredentialField label="Approval code" defaultValue="8F2K9Q" />
        <CredentialField
          label="Approval code"
          error="That code is incorrect."
          defaultValue="000000"
        />
        <CredentialField label="Approval code" disabled defaultValue="8F2K9Q" />
        <CredentialField label="Approval code" required placeholder="Enter code" />
      </Example>

      <Example
        label="CredentialOTP · length variants"
        code={`<CredentialOTP length={4} aria-label="Four-digit code" />
<CredentialOTP length={6} aria-label="Six-digit code" />
<CredentialOTP length={8} aria-label="Eight-digit code" />`}
      >
        <CredentialOTP length={4} aria-label="Four-digit code" />
        <CredentialOTP length={6} aria-label="Six-digit code" />
        <CredentialOTP length={8} aria-label="Eight-digit code" />
      </Example>

      <Example
        label="CredentialOTP · states"
        code={`<CredentialOTP length={6} defaultValue="123456" aria-label="Filled code" />
<CredentialOTP length={6} defaultValue="123" aria-label="Partially filled code" />
<CredentialOTP length={6} defaultValue="123456" invalid aria-label="Invalid code" />
<CredentialOTP length={6} defaultValue="123456" disabled aria-label="Disabled code" />`}
      >
        <CredentialOTP length={6} defaultValue="123456" aria-label="Filled code" />
        <CredentialOTP length={6} defaultValue="123" aria-label="Partially filled code" />
        <CredentialOTP length={6} defaultValue="123456" invalid aria-label="Invalid code" />
        <CredentialOTP length={6} defaultValue="123456" disabled aria-label="Disabled code" />
      </Example>

      <StorySource slug="credential-field" />
    </>
  );
}
