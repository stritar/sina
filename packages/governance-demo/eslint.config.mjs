import sina from "@sina-design-system/config/eslint";

/**
 * `governance-demo` is an app-support / demo package, not a governed library
 * layer. It sits ABOVE the layered libraries and legitimately composes `core`
 * (primitives), `fintech` (the constitution's evaluated result + fixtures), and
 * `governance` (the interception contract) to render the deterministic, LLM-free
 * interception console. It authors no schemas (no `zod`) — it only renders
 * decisions the constitution already made. Shared by the playground, docs, and
 * the marketing landing so those never duplicate the demo.
 */
export default [...sina];
