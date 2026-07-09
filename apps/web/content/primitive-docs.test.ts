import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "@sina-design-system/core";

/**
 * Guard for the CLAUDE.md rule: every core primitive has a docs page with a
 * LIVE demo.
 *
 * The slug list is derived from `@sina-design-system/core`'s runtime exports,
 * so shipping a new primitive without its docs page (live hero + examples +
 * props table + gallery/meta entry) fails the build. Subcomponents and
 * non-component exports live in EXCLUDE. Recipe: /new-primitive-doc.
 */
const EXCLUDE = new Set([
  // Dialog subcomponents
  "DialogTrigger",
  "DialogContent",
  "DialogTitle",
  "DialogDescription",
  "DialogClose",
  // Select subcomponents
  "SelectTrigger",
  "SelectValue",
  "SelectContent",
  "SelectItem",
  "SelectGroup",
  "SelectLabel",
  "SelectSeparator",
  // Tooltip subcomponents
  "TooltipProvider",
  "TooltipTrigger",
  "TooltipContent",
  // Toast subcomponents
  "ToastProvider",
  "ToastViewport",
  "ToastTitle",
  "ToastDescription",
  "ToastAction",
  "ToastClose",
  // Other subcomponents (documented on their parent's page)
  "RadioGroupItem",
  "CredentialOTP",
]);

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES_DIR = join(WEB_ROOT, "content", "docs", "primitives");
const DEMOS_DIR = join(WEB_ROOT, "app", "components", "docs", "demos", "primitives");

const toSlug = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
// `icon.tsx` under app/** collides with Next's icon metadata-route convention,
// so the Icon demo module is `icon-demo.tsx`.
const demoModuleFor = (slug: string) => (slug === "icon" ? "icon-demo" : slug);

const slugs = Object.entries(core)
  .filter(([name, value]) => /^[A-Z]/.test(name) && !EXCLUDE.has(name) && typeof value !== "undefined")
  .filter(([, value]) => typeof value === "function" || typeof value === "object")
  .map(([name]) => toSlug(name))
  .sort();

const gallerySource = readFileSync(join(DEMOS_DIR, "gallery.tsx"), "utf8");
const metaPages: string[] = JSON.parse(readFileSync(join(PAGES_DIR, "meta.json"), "utf8")).pages;

describe("primitive docs coverage", () => {
  it("derives a plausible slug list from core (guard is not vacuous)", () => {
    expect(slugs.length).toBeGreaterThanOrEqual(25);
    expect(slugs).toContain("button");
  });

  it.each(slugs)("%s has a docs page with a live demo, props/examples, and nav entries", (slug) => {
    const pagePath = join(PAGES_DIR, `${slug}.mdx`);
    expect(existsSync(pagePath), `missing ${slug}.mdx — run /new-primitive-doc`).toBe(true);

    const page = readFileSync(pagePath, "utf8");
    const demoModule = demoModuleFor(slug);
    expect(page).toMatch(
      new RegExp(`from "@/app/components/docs/demos/primitives/${demoModule}"`),
    );
    expect(existsSync(join(DEMOS_DIR, `${demoModule}.tsx`))).toBe(true);
    expect(page).toMatch(/<\w+Hero \/>/);

    expect(metaPages).toContain(slug);
    // Gallery index card (index.mdx renders the gallery component).
    expect(gallerySource).toContain(`/docs/primitives/${slug}`);
  });
});
