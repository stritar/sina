/**
 * theme.css → DTCG (W3C Design Tokens) parser.
 *
 * Reads the `--sina-*` custom properties out of `packages/theme/theme.css` and
 * converts them into DTCG token declarations for the DSDS catalog
 * (`public/dsds/tokens/sina.tokens.json`). Pure text-in/data-out so the
 * `content/dsds.test.ts` guard can run it against the live CSS.
 *
 * Only the main `:root` block (light) and the `.dark, [data-theme="dark"]`
 * block are read; the reduced-motion `@media` re-declarations are not tokens.
 * Values DTCG cannot honestly express (the `color-mix()` overlay and composite
 * shadow layers) land on `skipped` with a reason instead of being mangled —
 * the dark theme entity documents them in prose.
 *
 * DTCG has no theming standard, so dark overrides ride each token's
 * `$extensions["org.sina.modes"].dark`; light stays the canonical `$value`.
 */

/** Pull the declarations out of one top-level rule body. */
function declarationsOf(css, startIndex) {
  const open = css.indexOf("{", startIndex);
  let depth = 1;
  let i = open + 1;
  while (depth > 0 && i < css.length) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  const body = css.slice(open + 1, i - 1).replace(/\/\*[\s\S]*?\*\//g, "");
  const declarations = [];
  for (const chunk of body.split(";")) {
    const m = chunk.match(/--sina-([a-z0-9_-]+)\s*:\s*([\s\S]+)/);
    if (m) declarations.push({ name: m[1], value: m[2].replace(/\s+/g, " ").trim() });
  }
  return declarations;
}

/**
 * `--sina-` name → DTCG path. The identity's first dash segment is the
 * category; the rest of the identity and every `--` leaf modifier become
 * nested segments: `color-neutral--500` → color.neutral.500,
 * `color-text-muted` → color.text-muted, `font-weight--regular` →
 * font.weight.regular.
 */
export function tokenPath(name) {
  const [identity, ...modifiers] = name.split("--");
  const [category, ...rest] = identity.split("-");
  const path = [category];
  if (rest.length) path.push(rest.join("-"));
  path.push(...modifiers);
  return path;
}

const SINA_VAR_RE = /^var\(--sina-([a-z0-9_-]+)\)$/;

/** Convert one raw CSS value into a DTCG `$type`/`$value` pair, or null. */
export function convertValue(value) {
  if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value)) {
    return { $type: "color", $value: value.toLowerCase() };
  }
  const alias = value.match(SINA_VAR_RE);
  if (alias) return { $type: null, $value: `{${tokenPath(alias[1]).join(".")}}` };
  if (/^-?[\d.]+(rem|px|em)$/.test(value)) {
    return { $type: "dimension", $value: value };
  }
  if (/^[\d.]+ms$/.test(value)) return { $type: "duration", $value: value };
  if (/^-?[\d.]+$/.test(value)) return { $type: "number", $value: Number(value) };
  const bezier = value.match(/^cubic-bezier\(([^)]+)\)$/);
  if (bezier) {
    return { $type: "cubicBezier", $value: bezier[1].split(",").map(Number) };
  }
  // font stacks: comma-separated identifiers/quoted names, no functions
  if (value.includes(",") && !value.includes("(")) {
    return {
      $type: "fontFamily",
      $value: value.split(",").map((f) => f.trim().replace(/^"(.*)"$/, "$1")),
    };
  }
  return null;
}

/**
 * @returns {{
 *   tokens: Array<{ name: string, path: string[], type: string | null, value: unknown, darkValue?: unknown }>,
 *   skipped: Array<{ name: string, reason: string }>,
 *   declarationCount: number,
 * }}
 */
export function parseThemeCss(css) {
  const light = declarationsOf(css, css.indexOf(":root"));
  const dark = declarationsOf(css, css.indexOf('[data-theme="dark"]'));

  const tokens = [];
  const skipped = [];
  for (const { name, value } of light) {
    const converted = convertValue(value);
    if (!converted) {
      const reason = value.includes("color-mix(")
        ? "color-mix() translucency; DTCG has no computed-color form"
        : `unsupported value shape: ${value.slice(0, 40)}`;
      skipped.push({ name, reason });
      continue;
    }
    tokens.push({
      name,
      path: tokenPath(name),
      type: converted.$type,
      value: converted.$value,
    });
  }

  const byName = new Map(tokens.map((t) => [t.name, t]));
  for (const { name, value } of dark) {
    const token = byName.get(name);
    if (!token) continue; // dark override of a skipped (composite) token
    const converted = convertValue(value);
    if (converted) token.darkValue = converted.$value;
  }

  return { tokens, skipped, declarationCount: light.length };
}

/** Nest the flat token list into a DTCG document. */
export function toDtcg(parsed) {
  const doc = {
    $description:
      "SINA design tokens, generated from packages/theme/theme.css. Light values are canonical; dark-theme overrides ride $extensions['org.sina.modes'].dark (DTCG has no theming standard). Composite values (shadows, color-mix overlays) are not representable and are documented on the DSDS dark theme entity instead.",
  };
  for (const token of parsed.tokens) {
    let node = doc;
    for (const segment of token.path.slice(0, -1)) {
      node = node[segment] ??= {};
    }
    const leaf = { $value: token.value };
    if (token.type) leaf.$type = token.type;
    if (token.darkValue !== undefined) {
      leaf.$extensions = { "org.sina.modes": { dark: token.darkValue } };
    }
    node[token.path.at(-1)] = leaf;
  }
  return doc;
}
