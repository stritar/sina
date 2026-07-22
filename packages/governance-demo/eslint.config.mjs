import sina from "@sina-design-system/config/eslint";

/**
 * `governance-demo` is an app-support / demo package, not a governed library
 * layer. It sits ABOVE the layered libraries and legitimately composes `core`
 * (primitives), `fintech` (the constitution's evaluated result + fixtures),
 * `governance` (the interception contract), and `fintech-react` (the governed
 * components the constitution FORCES) to render the deterministic, LLM-free
 * interception console and the interactive re-gate flows. It authors no schemas
 * (no `zod`) — it only renders decisions the constitution already made, and it
 * never gates client-side: the gate and every re-gate run on a server, reached
 * through an injected `GateTransport`. Shared by the playground, docs, and the
 * marketing landing so those never duplicate the demo.
 */
export default [...sina];
