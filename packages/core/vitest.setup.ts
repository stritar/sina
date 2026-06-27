import { afterEach, expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
import { cleanup } from "@testing-library/react";

// Register jest-axe's matcher so every primitive can assert `toHaveNoViolations()`.
// This is the automated a11y gate the ROADMAP requires (Phase 2 hardens it).
expect.extend(toHaveNoViolations);

// Unmount React trees between tests. RTL only auto-registers this when Vitest
// `globals` is enabled; we keep globals off and wire cleanup explicitly so
// `screen` queries never see leftover DOM from a previous test.
afterEach(() => {
  cleanup();
});
