import { defineConfig } from "vitest/config";

// The gate suite is pure logic; the a11y suite renders the read-only console —
// jsdom + jest-axe, same automated bar as core/fintech-react.
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: { modules: { classNameStrategy: "non-scoped" } },
    // The demo mounts its governed components through `React.lazy` (registry.tsx), so the
    // dialog trigger only exists once the dynamic `fintech-react → core` import chain
    // resolves, which the tests wait on with `findBy*`. Those waits used to sit at 5000ms
    // against Vitest's default 5000ms per-test budget, so on a loaded runner both expired
    // at once ("Unable to find role=button /Review wire transfer/"). This budget must stay
    // above LAZY_MOUNT_TIMEOUT so the wait, not the test timeout, reports a real failure.
    testTimeout: 20000,
  },
});
