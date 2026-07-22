import { describe, expect, it, beforeAll } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { fintechIntentManifest } from "@sina-design-system/fintech";
import { buildDsds } from "../scripts/dsds/build-dsds.mjs";
import { parseThemeCss } from "../scripts/dsds/parse-theme-css.mjs";
import { corePrimitiveSlugs } from "./core-slugs";

/**
 * Guard for the DSDS catalog (`scripts/generate-dsds.mjs` → `public/dsds/**`).
 *
 * Runs the same in-memory builder the generator uses and enforces:
 *  1. every document validates against the vendored DSDS 0.15.2 schema, and
 *     every manifest `$ref` resolves to an emitted file;
 *  2. coverage — every core primitive has a component entity, every fintech
 *     intent has a pattern entity;
 *  3. props sync — every primitive page's `<PropsTable>` is fed by a
 *     `props/*.props.mjs` module, every module maps back to a page, and
 *     descriptions obey the no-dash prose rule (they left the `.mdx` files
 *     the docs-prose guard scans);
 *  4. token accounting — every `--sina-*` declaration is either converted to
 *     DTCG or skipped with a reason (nothing silently dropped).
 */
const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES_DIR = join(WEB_ROOT, "content", "docs", "primitives");
const PROPS_DIR = join(WEB_ROOT, "app", "components", "docs", "props");

let files: Map<string, Record<string, unknown>>;

beforeAll(async () => {
  ({ files } = await buildDsds({ webRoot: WEB_ROOT }));
});

describe("dsds catalog", () => {
  it("emits a manifest and no fintech-dist warning under the test build", async () => {
    const { patternWarning } = await buildDsds({ webRoot: WEB_ROOT });
    expect(patternWarning).toBeNull();
    expect(files.has("manifest.dsds.json")).toBe(true);
  });

  it("every document validates against the vendored DSDS schema", () => {
    const schema = JSON.parse(
      readFileSync(join(WEB_ROOT, "scripts", "dsds", "dsds.bundled.schema.json"), "utf8"),
    );
    const ajv = new Ajv2020({ strict: false, allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    for (const [path, doc] of files) {
      if (path === "tokens/sina.tokens.json") continue; // DTCG, not DSDS
      const ok = validate(doc);
      const errors = (validate.errors ?? [])
        .map((e) => `${e.instancePath} ${e.message}`)
        .join("; ");
      expect(ok, `${path}: ${errors}`).toBe(true);
    }
  });

  it("every manifest $ref resolves to an emitted file, identifiers unique per group", () => {
    const manifest = files.get("manifest.dsds.json") as {
      entityGroups: Array<{ name: string; entities: Array<{ $ref: string }> }>;
    };
    for (const group of manifest.entityGroups) {
      const identifiers = new Set<string>();
      for (const { $ref } of group.entities) {
        const [file = "", pointer] = $ref.split("#");
        const target = files.get(file.replace(/^\.\//, "")) as
          | { entity?: { identifier: string } }
          | undefined;
        expect(target, `${group.name}: ${$ref} does not resolve`).toBeDefined();
        expect(pointer).toBe("/entity");
        const id = target!.entity!.identifier;
        expect(identifiers.has(id), `${group.name}: duplicate identifier ${id}`).toBe(false);
        identifiers.add(id);
      }
    }
  });

  it("token entities point their source at the emitted DTCG file", () => {
    expect(files.has("tokens/sina.tokens.json")).toBe(true);
    for (const [path, doc] of files) {
      if (!path.startsWith("tokens/") || path === "tokens/sina.tokens.json") continue;
      const entity = (doc as { entity: { source: { file: string } } }).entity;
      expect(entity.source.file, path).toBe("./sina.tokens.json");
    }
  });

  it.each(corePrimitiveSlugs())("core primitive %s has a component entity", (slug) => {
    const doc = files.get(`components/${slug}.dsds.json`) as
      | { entity: { kind: string; identifier: string } }
      | undefined;
    expect(doc, `missing DSDS entity for ${slug}`).toBeDefined();
    expect(doc!.entity.kind).toBe("component");
    expect(doc!.entity.identifier).toBe(slug);
  });

  it("every fintech intent has a pattern entity carrying its props schema", () => {
    for (const descriptor of fintechIntentManifest()) {
      const identifier = descriptor.intent.replace(/_/g, "-");
      const doc = files.get(`patterns/${identifier}.dsds.json`) as
        | { entity: { $extensions: Record<string, { intent: string; propsSchema: unknown }> } }
        | undefined;
      expect(doc, `missing pattern entity for ${descriptor.intent}`).toBeDefined();
      const governance = doc!.entity.$extensions["org.sina.governance"];
      expect(governance?.intent).toBe(descriptor.intent);
      expect(governance?.propsSchema).toBeTruthy();
    }
  });
});

describe("props data modules", () => {
  const pageSlugs = readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .filter((slug) => slug !== "index");
  const moduleSlugs = readdirSync(PROPS_DIR)
    .filter((f) => f.endsWith(".props.mjs"))
    .map((f) => f.replace(/\.props\.mjs$/, ""));

  it("every page with a <PropsTable> is fed by its props module", () => {
    for (const slug of pageSlugs) {
      const page = readFileSync(join(PAGES_DIR, `${slug}.mdx`), "utf8");
      if (!page.includes("<PropsTable")) continue;
      expect(
        page,
        `${slug}.mdx must import its props module (inline rows are banned — see props/prop-docs.mjs)`,
      ).toContain(`from "@/app/components/docs/props/${slug}.props.mjs"`);
      expect(page).toMatch(/<PropsTable rows=\{\w+PropRows\(\)\} \/>/);
      expect(moduleSlugs).toContain(slug);
    }
  });

  it("every props module maps back to a page that uses it", () => {
    for (const slug of moduleSlugs) {
      const pagePath = join(PAGES_DIR, `${slug}.mdx`);
      expect(existsSync(pagePath), `${slug}.props.mjs has no docs page`).toBe(true);
      expect(readFileSync(pagePath, "utf8")).toContain(`${slug}.props.mjs`);
    }
  });

  it("prop descriptions have no dashes", async () => {
    for (const slug of moduleSlugs) {
      const mod = await import(join(PROPS_DIR, `${slug}.props.mjs`));
      const propDoc = Object.values(mod).find(
        (v): v is { props: Array<{ prop: string; description: string }> } =>
          typeof v === "object" && v !== null && "props" in v,
      );
      expect(propDoc, `${slug}.props.mjs exports no PropDoc`).toBeDefined();
      for (const row of propDoc!.props) {
        expect(
          /[—–]/.test(row.description),
          `${slug}.props.mjs "${row.prop}": em/en-dash in description (prose rule)`,
        ).toBe(false);
      }
    }
  });
});

describe("token accounting", () => {
  it("every theme.css declaration is converted or skipped with a reason", () => {
    const css = readFileSync(
      join(WEB_ROOT, "..", "..", "packages", "theme", "theme.css"),
      "utf8",
    );
    const parsed = parseThemeCss(css);
    expect(parsed.tokens.length + parsed.skipped.length).toBe(parsed.declarationCount);
    expect(parsed.declarationCount).toBeGreaterThanOrEqual(200); // not vacuous
    for (const skip of parsed.skipped) {
      expect(skip.reason, `--sina-${skip.name} skipped without a reason`).toBeTruthy();
    }
    // spot-checks against known tokens
    const neutral500 = parsed.tokens.find((t: { name: string }) => t.name === "color-neutral--500");
    expect(neutral500).toMatchObject({ type: "color", value: "#84897e" });
    const bg = parsed.tokens.find((t: { name: string }) => t.name === "color-bg");
    expect(bg?.darkValue, "color-bg must carry its dark override").toBeDefined();
  });
});
