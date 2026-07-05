// Chart.js primitives render to a <canvas>; jsdom has no 2D context, so mock it
// (same as core's setup). Charted display components — BalanceTrend, AssetDetail,
// CashflowSummary, SpendingBreakdown, PortfolioHoldings — mount a real chart in
// jsdom and would otherwise throw on `getContext`.
import "vitest-canvas-mock";
import { afterEach, expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
import { cleanup } from "@testing-library/react";

// Chart.js `responsive: true` observes size changes; jsdom has no ResizeObserver.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Register jest-axe's matcher so every governed component asserts the a11y bar
// (focus-trap + ARIA + keyboard), the same automated gate core primitives meet.
expect.extend(toHaveNoViolations);

// Unmount React trees between tests (globals stay off, so wire cleanup explicitly).
afterEach(() => {
  cleanup();
});
