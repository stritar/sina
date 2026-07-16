/**
 * SINA translation glossary — the terminology contract the `/translate-docs`
 * skill is bound to.
 *
 * 250 independently translated files drift on their core vocabulary unless the
 * load-bearing terms have one agreed rendering per locale. `GLOSSARY` fixes those
 * renderings; `KEEP_IN_ENGLISH` lists product, brand, and code identifiers that
 * must never be translated. Seeded from `content/docs/reference/glossary.mdx` —
 * keep the two in sync when a term is added there.
 */

export interface GlossaryTerm {
  /** Why the term is load-bearing (guidance for the translator, not shipped). */
  note: string;
  /** The agreed rendering per translated locale. */
  translations: {
    es: string;
    zh: string;
    fr: string;
    de: string;
    ja: string;
  };
}

/** Terms that must translate identically everywhere they appear. */
export const GLOSSARY: Record<string, GlossaryTerm> = {
  intent: {
    note: "What the model emits (intent + props, never a component). Central SINA concept.",
    translations: { es: "intención", zh: "意图", fr: "intention", de: "Absicht", ja: "インテント" },
  },
  governance: {
    note: "The whole point of SINA: rules validated server-side before anything mounts.",
    translations: { es: "gobernanza", zh: "治理", fr: "gouvernance", de: "Governance", ja: "ガバナンス" },
  },
  governed: {
    note: "A component/flow that passed the gate.",
    translations: { es: "gobernado", zh: "受治理的", fr: "gouverné", de: "geregelt", ja: "統制された" },
  },
  constitution: {
    note: "The set of Zod schemas an industry encodes. Proper noun in SINA.",
    translations: { es: "constitución", zh: "章程", fr: "constitution", de: "Verfassung", ja: "憲章" },
  },
  escalation: {
    note: "When a rule forces a heavier governed component instead of blocking outright.",
    translations: { es: "escalado", zh: "升级", fr: "escalade", de: "Eskalation", ja: "エスカレーション" },
  },
  gate: {
    note: "The server-side validation step. `validate, then mount`.",
    translations: { es: "control", zh: "关卡", fr: "contrôle", de: "Kontrollpunkt", ja: "ゲート" },
  },
  interception: {
    note: "The gate rejecting/redirecting an intent. Returns the interception contract.",
    translations: { es: "intercepción", zh: "拦截", fr: "interception", de: "Abfangen", ja: "インターセプト" },
  },
  violation: {
    note: "A single failed rule in the interception result.",
    translations: { es: "infracción", zh: "违规", fr: "violation", de: "Verstoß", ja: "違反" },
  },
  primitive: {
    note: "A headless accessible core component (Button, Dialog, …).",
    translations: { es: "primitiva", zh: "基础组件", fr: "primitive", de: "Primitive", ja: "プリミティブ" },
  },
  "audit trail": {
    note: "The record every interception emits.",
    translations: {
      es: "registro de auditoría",
      zh: "审计追踪",
      fr: "piste d'audit",
      de: "Audit-Trail",
      ja: "監査証跡",
    },
  },
  "design system": {
    note: "What SINA is.",
    translations: {
      es: "sistema de diseño",
      zh: "设计系统",
      fr: "système de design",
      de: "Designsystem",
      ja: "デザインシステム",
    },
  },
  "validate-then-mount": {
    note: "The core principle. Keep the English coinage in parentheses on first use per page.",
    translations: {
      es: "validar y luego montar",
      zh: "先校验再挂载",
      fr: "valider puis monter",
      de: "erst validieren, dann einbinden",
      ja: "検証してからマウント",
    },
  },
};

/**
 * Never translate these: brand, product, package, and code identifiers. Keep
 * verbatim (including casing) inside otherwise translated prose.
 */
export const KEEP_IN_ENGLISH: readonly string[] = [
  "SINA",
  "@sina-design-system",
  "Zod",
  "React",
  "RSC",
  "Radix",
  "Cloudflare",
  "Phosphor",
  "TypeScript",
  "Next.js",
  "props",
  "SecureWireDialog",
  "fintech",
  "defense",
  // Design token names (`--sina-*`) and component identifiers stay verbatim; they
  // are code, and the skill also protects everything inside `code`/fences.
];
