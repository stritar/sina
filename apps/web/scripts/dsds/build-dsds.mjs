import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { parseThemeCss, toDtcg } from "./parse-theme-css.mjs";
import { GLOBAL_RULES, COMPONENT_RULES, PATTERN_RULES } from "./agent-rules.mjs";

/**
 * Build the DSDS catalog (designsystemdocspec.org, v0.15.2) in memory.
 *
 * Returns a Map of `public/dsds/`-relative paths to JSON documents: the
 * manifest, one entity file per component / pattern / guide / theme, the token
 * groups, and the DTCG tokens file. `generate-dsds.mjs` writes the map to disk
 * at build; `content/dsds.test.ts` validates the same map against the vendored
 * schema without touching the filesystem.
 *
 * Everything is derived, never invented: components from the primitive docs
 * pages + their `props/*.props.mjs` modules, tokens from `theme.css`, patterns
 * from `fintechIntentManifest()`, guides from the docs pages themselves. The
 * fintech import is optional (its dist may be missing on a fresh clone's
 * `predev`) — patterns are skipped with a warning in that case.
 */

const DSDS_VERSION = "0.15.2";
const BASE_URL = "https://sinahub.app";
const LOCALE_SIBLING = /\.(es|zh|fr|de|ja)\.mdx$/;

const require = createRequire(import.meta.url);

const toPascal = (slug) =>
  slug.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const entityFile = (dir, identifier) => `${dir}/${identifier}.dsds.json`;
const doc = (entity) => ({ dsdsVersion: DSDS_VERSION, entity });

/** Frontmatter title + the first prose paragraph + a `## <heading>` section. */
function proseOf(mdx) {
  const title = mdx.match(/^title: (.+)$/m)?.[1]?.trim();
  const body = mdx.replace(/^---\n[\s\S]*?\n---\n/, "");
  const paragraphs = body.split(/\n\n+/).map((p) => p.trim());
  const firstProse = paragraphs.find(
    (p) =>
      p &&
      !p.startsWith("import ") &&
      !p.startsWith("<") &&
      !p.startsWith("#") &&
      !p.startsWith("```"),
  );
  const section = (heading) => {
    const m = body.match(new RegExp(`\\n## ${heading}\\n+([\\s\\S]*?)(?=\\n## |$)`));
    return m?.[1]?.trim() || null;
  };
  return { title, description: firstProse?.replace(/\n/g, " ") ?? null, section };
}

async function walkDocs(contentRoot) {
  const files = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith(".mdx") && !LOCALE_SIBLING.test(entry.name))
        files.push(full);
    }
  };
  await walk(contentRoot);
  return files;
}

// `primitives/badge.mdx` -> `primitives/badge`; folder `index.mdx` collapses
// (mirrors scripts/generate-llms.mjs, which names the raw markdown assets).
const toSlug = (contentRoot, file) =>
  relative(contentRoot, file)
    .replace(/\\/g, "/")
    .replace(/\.mdx$/, "")
    .replace(/\/index$/, "");

async function componentEntity(webRoot, slug, mdx) {
  const { title, description, section } = proseOf(mdx);
  const name = title ?? toPascal(slug);
  const blocks = [
    {
      kind: "imports",
      items: [
        {
          platform: "react",
          package: "@sina-design-system/core",
          code: `import { ${toPascal(slug)} } from "@sina-design-system/core";`,
        },
      ],
    },
  ];

  const propsModulePath = join(
    webRoot,
    "app/components/docs/props",
    `${slug}.props.mjs`,
  );
  let propDoc = null;
  try {
    const mod = await import(pathToFileURL(propsModulePath).href);
    propDoc = Object.values(mod).find((v) => v && typeof v === "object" && v.props);
  } catch {
    // primitive without an extracted props table (composite API documented in prose)
  }
  if (propDoc) {
    blocks.push({
      kind: "api",
      platform: "react",
      properties: propDoc.props.map((row) => ({
        identifier: row.prop,
        type: row.type,
        description: row.description,
        ...(row.default !== undefined && { defaultValue: row.default }),
      })),
    });
  }

  const a11y = section("Accessibility");
  if (a11y) {
    blocks.push({ kind: "sections", items: [{ title: "Accessibility", body: a11y }] });
  }

  return {
    kind: "component",
    identifier: slug,
    name,
    ...(description && { description }),
    metadata: {
      docOrigin: "extracted",
      links: [
        {
          kind: "documentation",
          url: `${BASE_URL}/docs/primitives/${slug}`,
          label: "Docs page",
        },
        {
          kind: "documentation",
          url: `${BASE_URL}/llms/docs/primitives/${slug}.md`,
          label: "Raw markdown",
        },
      ],
    },
    documentBlocks: blocks,
    agentDocumentBlocks: [
      {
        kind: "guidelines",
        items: [...GLOBAL_RULES, ...(COMPONENT_RULES[slug] ?? [])],
      },
    ],
    $extensions: {
      "org.sina.docs": {
        page: `/docs/primitives/${slug}`,
        raw: `/llms/docs/primitives/${slug}.md`,
      },
    },
  };
}

function tokenEntities(parsed) {
  const byCategory = new Map();
  for (const token of parsed.tokens) {
    const category = token.path[0];
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(token);
  }
  const skippedByCategory = new Map();
  for (const skip of parsed.skipped) {
    const category = skip.name.split("-")[0];
    if (!skippedByCategory.has(category)) skippedByCategory.set(category, []);
    skippedByCategory.get(category).push(skip);
  }

  const groups = [];
  for (const [category, tokens] of byCategory) {
    const types = new Set(tokens.map((t) => t.type).filter(Boolean));
    const skips = skippedByCategory.get(category) ?? [];
    const group = {
      kind: "token-group",
      identifier: category,
      ...(types.size === 1 && { tokenType: [...types][0] }),
      source: { file: "./sina.tokens.json", path: category },
      ...(skips.length && {
        description: `Not in the DTCG file (unrepresentable values): ${skips
          .map((s) => `--sina-${s.name}`)
          .join(", ")}. See the dark theme entity for why.`,
      }),
      children: tokens.map((token) => ({
        kind: "token",
        identifier: token.name.replace(/--/g, "-"),
        ...(types.size !== 1 && token.type && { tokenType: token.type }),
        source: { file: "./sina.tokens.json", path: token.path.join(".") },
      })),
    };
    // aliases have no parsed type; give the group's tokens one when uniform,
    // else fall back to the alias target's category being self-describing
    for (const child of group.children) {
      if (!group.tokenType && !child.tokenType) child.tokenType = category === "color" ? "color" : "string";
    }
    groups.push(group);
  }
  return groups;
}

function themeEntities(parsed) {
  const darkCount = parsed.tokens.filter((t) => t.darkValue !== undefined).length;
  const skippedList = parsed.skipped.map((s) => `--sina-${s.name}`).join(", ");
  return [
    {
      kind: "theme",
      identifier: "light",
      name: "Light",
      description:
        "The default theme: every token's canonical `$value` in the DTCG file is the light value.",
      source: { file: "../tokens/sina.tokens.json" },
    },
    {
      kind: "theme",
      identifier: "dark",
      name: "Dark",
      description:
        `Activated by the \`.dark\` class or \`[data-theme="dark"]\` attribute on a root element. ` +
        `${darkCount} tokens override their light value; each override lives on the token's ` +
        "`$extensions[\"org.sina.modes\"].dark` in the DTCG file (DTCG has no theming standard). " +
        "Both themes are held to WCAG AA by build guards. Not representable in DTCG and therefore " +
        `absent from the file: ${skippedList} (color-mix() translucency and composite shadows; ` +
        "in dark, shadows switch to true black at raised alpha and overlays re-mix over the dark surface).",
      source: { file: "../tokens/sina.tokens.json" },
    },
  ];
}

function patternEntity(descriptor, standards) {
  const identifier = descriptor.intent.replace(/_/g, "-");
  const name =
    descriptor.intent.charAt(0).toUpperCase() +
    descriptor.intent.slice(1).replace(/_/g, " ");
  const matchedStandards = standards
    .filter((s) => s.where.some((w) => w.includes(descriptor.intent)))
    .map((s) => s.id);
  return {
    kind: "pattern",
    identifier,
    name,
    description: descriptor.summary,
    metadata: { docOrigin: "generated" },
    agentDocumentBlocks: [{ kind: "guidelines", items: PATTERN_RULES(descriptor) }],
    $extensions: {
      "org.sina.governance": {
        intent: descriptor.intent,
        kind: descriptor.kind,
        component: descriptor.component,
        propsSchema: descriptor.propsSchema,
        ...(matchedStandards.length && { standards: matchedStandards }),
      },
    },
  };
}

function guideEntity(slug, mdx) {
  const { title, description } = proseOf(mdx);
  const identifier = (slug || "index").replace(/\//g, "-");
  const raw = `/llms/docs/${slug || "index"}.md`;
  return {
    kind: "guide",
    identifier,
    name: title ?? identifier,
    ...(description && { description }),
    metadata: {
      docOrigin: "extracted",
      links: [
        {
          kind: "documentation",
          url: `${BASE_URL}/docs${slug ? `/${slug}` : ""}`,
          label: "Docs page",
        },
        { kind: "documentation", url: `${BASE_URL}${raw}`, label: "Raw markdown" },
      ],
    },
    $extensions: {
      "org.sina.docs": { page: `/docs${slug ? `/${slug}` : ""}`, raw },
    },
  };
}

/**
 * @param {{ webRoot: string }} options
 * @returns {Promise<{ files: Map<string, Record<string, unknown>>, patternWarning: string | null }>}
 *   `files` maps `public/dsds/`-relative paths to JSON documents.
 */
export async function buildDsds({ webRoot }) {
  const contentRoot = join(webRoot, "content", "docs");
  const files = new Map();

  // --- components ------------------------------------------------------
  const docFiles = await walkDocs(contentRoot);
  const componentRefs = [];
  for (const file of docFiles.sort()) {
    const slug = toSlug(contentRoot, file);
    if (!slug.startsWith("primitives/") ) continue;
    const short = slug.slice("primitives/".length);
    if (!short) continue; // primitives/index.mdx is the gallery, not a component
    const entity = await componentEntity(webRoot, short, await readFile(file, "utf8"));
    files.set(entityFile("components", short), doc(entity));
    componentRefs.push({ $ref: `./components/${short}.dsds.json#/entity` });
  }

  // --- tokens + themes -------------------------------------------------
  const themeCss = await readFile(
    require.resolve("@sina-design-system/theme/theme.css"),
    "utf8",
  );
  const parsed = parseThemeCss(themeCss);
  files.set("tokens/sina.tokens.json", toDtcg(parsed));
  const tokenRefs = [];
  for (const group of tokenEntities(parsed)) {
    files.set(entityFile("tokens", group.identifier), doc(group));
    tokenRefs.push({ $ref: `./tokens/${group.identifier}.dsds.json#/entity` });
  }
  const themeRefs = [];
  for (const theme of themeEntities(parsed)) {
    files.set(entityFile("themes", theme.identifier), doc(theme));
    themeRefs.push({ $ref: `./themes/${theme.identifier}.dsds.json#/entity` });
  }

  // --- patterns (fintech dist may be absent on a fresh clone's predev) --
  const patternRefs = [];
  let patternWarning = null;
  try {
    const [{ fintechIntentManifest }, { FINTECH_STANDARDS }] = await Promise.all([
      import("@sina-design-system/fintech"),
      import("@sina-design-system/fintech/standards"),
    ]);
    for (const descriptor of fintechIntentManifest()) {
      const entity = patternEntity(descriptor, FINTECH_STANDARDS);
      files.set(entityFile("patterns", entity.identifier), doc(entity));
      patternRefs.push({ $ref: `./patterns/${entity.identifier}.dsds.json#/entity` });
    }
  } catch {
    patternWarning =
      "[dsds] fintech dist missing — pattern entities skipped; run `pnpm --filter @sina-design-system/fintech build`";
  }

  // --- guides (every non-primitive docs page) --------------------------
  const guideRefs = [];
  for (const file of docFiles.sort()) {
    const slug = toSlug(contentRoot, file);
    if (slug.startsWith("primitives")) continue;
    const entity = guideEntity(slug, await readFile(file, "utf8"));
    files.set(entityFile("guides", entity.identifier), doc(entity));
    guideRefs.push({ $ref: `./guides/${entity.identifier}.dsds.json#/entity` });
  }

  // --- manifest --------------------------------------------------------
  const core = require(join(webRoot, "..", "..", "packages", "core", "package.json"));
  files.set("manifest.dsds.json", {
    $schema: `https://designsystemdocspec.org/v${DSDS_VERSION}/dsds.bundled.schema.json`,
    dsdsVersion: DSDS_VERSION,
    systemInfo: {
      name: "SINA",
      version: core.version,
      organization: "SINA",
      url: BASE_URL,
      license: core.license,
    },
    entityGroups: [
      { name: "Components", entities: componentRefs },
      { name: "Tokens", entities: tokenRefs },
      { name: "Themes", entities: themeRefs },
      ...(patternRefs.length ? [{ name: "Fintech patterns", entities: patternRefs }] : []),
      { name: "Guides", entities: guideRefs },
    ],
  });

  return { files, patternWarning };
}
