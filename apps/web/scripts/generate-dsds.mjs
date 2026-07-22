import { writeFile, mkdir, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDsds } from "./dsds/build-dsds.mjs";

/**
 * Emit the DSDS catalog (designsystemdocspec.org) as static assets under
 * `public/dsds/**` — the machine-readable twin of the docs, discoverable from
 * `/llms.txt` at `/dsds/manifest.dsds.json`. Runs from `predev`/`prebuild`
 * after `generate-llms.mjs` (guide entities link the raw markdown it emits);
 * like that script, it never adds a Route Handler, so `apps/web` stays
 * Cloudflare-static-deployable. The catalog logic lives in `dsds/build-dsds.mjs`
 * so the `content/dsds.test.ts` guard can validate the same output in memory.
 */
const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ROOT = join(webRoot, "public", "dsds");

async function main() {
  await rm(OUT_ROOT, { recursive: true, force: true });
  const { files, patternWarning } = await buildDsds({ webRoot });
  if (patternWarning) console.warn(patternWarning);
  for (const [path, json] of files) {
    const out = join(OUT_ROOT, path);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  }
  console.log(`[dsds] wrote ${files.size} catalog files to public/dsds`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
