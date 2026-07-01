import { afterEach, expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
import { cleanup } from "@testing-library/react";

// Register jest-axe's matcher so every governed component asserts the a11y bar
// (focus-trap + ARIA + keyboard), the same automated gate core primitives meet.
expect.extend(toHaveNoViolations);

// Unmount React trees between tests (globals stay off, so wire cleanup explicitly).
afterEach(() => {
  cleanup();
});
