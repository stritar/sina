import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

// Register jest-axe's matcher so every primitive can assert `toHaveNoViolations()`.
// This is the automated a11y gate the ROADMAP requires (Phase 2 hardens it).
expect.extend(toHaveNoViolations);
