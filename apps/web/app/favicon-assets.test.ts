import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

/**
 * Guard: the favicon set stays declared, in step, and ADAPTIVE.
 *
 * The set is a bare mark on transparency whose ink follows the color scheme. Every
 * surface that can carry a light/dark pair does: icon.svg self-adapts via an embedded
 * `prefers-color-scheme` rule, and favicon.ico ships as a pair chosen by the `media`
 * attribute on the <link>. apple-touch-icon and the manifest icons have no dark
 * channel at all and carry one ink. Regenerate with `scripts/generate-favicons.mjs`,
 * never by hand.
 *
 * Failure modes these encode, all of which have bitten this site:
 *
 *   1. A declared icon points at a file that isn't there. Nothing warns; the tab just
 *      falls back to a letter tile.
 *   2. `app/layout.tsx` and `public/site.webmanifest` drift on the `?v=` cache-buster.
 *      Browsers cache favicons hard, so a half-bumped set means some surfaces keep
 *      showing the old artwork indefinitely.
 *   3. The pair collapses. Emitting two .ico files proves nothing on its own — if the
 *      generator passes the same ink twice, or the `media` attribute is dropped from
 *      the <link>, the set still looks well-formed while doing nothing. So the inks
 *      are compared pixel-to-pixel, and the media attribute is asserted directly.
 *   4. The theme query is stripped from icon.svg, silently reverting it to one ink.
 *
 * NOT guarded, because CSS cannot express it: a favicon sits on the BROWSER CHROME,
 * and Chrome's theme can be dark while the OS is light. `prefers-color-scheme` reports
 * the OS, so a light-OS user on a dark Chrome theme still gets the dark mark on a dark
 * strip. That tradeoff was taken knowingly; see the block in generate-favicons.mjs.
 */

// vitest runs with cwd = apps/web (the package root).
const WEB = process.cwd();
const PUBLIC = join(WEB, "public");

const INK = [0x35, 0x3b, 0x31] as const; //      --sina-color-neutral--900, light scheme
const INK_DARK = [0xf5, 0xf6, 0xf4] as const; // --sina-color-neutral--50, dark scheme
const PLATE = [0xf5, 0xf6, 0xf4] as const; //    --sina-color-neutral--50

/** Plateless rasters: a bare mark on alpha, one ink, no dark channel available. */
const TRANSPARENT_PNGS = ["apple-touch-icon.png", "icon-192.png", "icon-512.png"];
/**
 * The one asset that keeps an opaque plate. Not a stylistic exception: the maskable
 * spec requires the image to fill its canvas, because the launcher crops into it. A
 * transparent maskable shows wallpaper through the mask.
 */
const MASKABLE = "icon-maskable-512.png";

// ---------------------------------------------------------------------------
// Minimal decoders. Only the shapes `generate-favicons.mjs` emits are supported
// (8-bit RGBA, non-interlaced PNG; PNG-in-ICO), so an unexpected encoding throws
// rather than being silently waved through.
// ---------------------------------------------------------------------------

type Pixels = { width: number; height: number; data: Buffer };

function decodePng(buf: Buffer): Pixels {
  expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

  let width = 0;
  let height = 0;
  const idat: Buffer[] = [];

  for (let at = 8; at < buf.length; ) {
    const length = buf.readUInt32BE(at);
    const type = buf.subarray(at + 4, at + 8).toString("ascii");
    const body = buf.subarray(at + 8, at + 8 + length);

    if (type === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      expect(body.readUInt8(8), "bit depth").toBe(8);
      expect(body.readUInt8(9), "color type (6 = RGBA)").toBe(6);
      expect(body.readUInt8(12), "interlace method").toBe(0);
    } else if (type === "IDAT") {
      idat.push(body);
    }
    at += 12 + length; // length + type + body + crc
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const out = Buffer.alloc(height * stride);

  // Out-of-bounds neighbours are zero by the PNG spec, which is also what
  // `noUncheckedIndexedAccess` wants us to say out loud.
  const byte = (buf: Buffer, i: number) => buf[i] ?? 0;

  // Undo the per-scanline filters (PNG spec §9.2).
  for (let y = 0; y < height; y++) {
    const filter = byte(raw, y * (stride + 1));
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? byte(out, y * stride + x - 4) : 0; // left
      const b = y > 0 ? byte(out, (y - 1) * stride + x) : 0; // up
      const c = x >= 4 && y > 0 ? byte(out, (y - 1) * stride + x - 4) : 0; // up-left
      let value = byte(line, x);
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`unknown PNG filter ${filter}`);
      out[y * stride + x] = value & 0xff;
    }
  }

  return { width, height, data: out };
}

/** Every image packed into an .ico container. */
function decodeIco(buf: Buffer): Pixels[] {
  expect(buf.readUInt16LE(0), "ICO reserved field").toBe(0);
  expect(buf.readUInt16LE(2), "ICO type (1 = icon)").toBe(1);

  const count = buf.readUInt16LE(4);
  return Array.from({ length: count }, (_, i) => {
    const entry = 6 + i * 16;
    const size = buf.readUInt32LE(entry + 8);
    const offset = buf.readUInt32LE(entry + 12);
    return decodePng(buf.subarray(offset, offset + size));
  });
}

const pixelAt = ({ width, data }: Pixels, x: number, y: number) =>
  [...data.subarray((y * width + x) * 4, (y * width + x) * 4 + 4)];

/** Share of pixels that are FULLY transparent. Anti-aliased edges don't count. */
function transparentShare({ width, height, data }: Pixels): number {
  let clear = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] === 0) clear++;
  return clear / (width * height);
}

/**
 * The mark's ink, read off the most opaque pixel. PNG alpha is straight, not
 * premultiplied, so a partially-covered edge pixel still carries the pure ink in RGB
 * — which matters at 16px, where a stroke this thin may never reach alpha 255.
 */
function inkOf({ data }: Pixels): number[] {
  let best = -1;
  let at = 0;
  for (let i = 3; i < data.length; i += 4) {
    const alpha = data[i] ?? 0;
    if (alpha > best) {
      best = alpha;
      at = i - 3;
    }
  }
  expect(best, "the mark has to draw something").toBeGreaterThan(0);
  return [...data.subarray(at, at + 3)];
}

// ---------------------------------------------------------------------------

/** The `icons: { … }` literal from app/layout.tsx, as source text. */
const readIconsBlock = async () => {
  const layout = await readFile(join(WEB, "app", "layout.tsx"), "utf8");
  return layout.slice(layout.indexOf("icons: {"), layout.indexOf("};"));
};

const readIconUrls = async () =>
  [...(await readIconsBlock()).matchAll(/url:\s*"([^"]+)"/g)]
    .map((m) => m[1])
    .filter((url): url is string => url !== undefined);

const readManifest = async () =>
  JSON.parse(await readFile(join(PUBLIC, "site.webmanifest"), "utf8")) as {
    icons: { src: string }[];
  };

describe("favicon assets", () => {
  it("every declared icon resolves to a file in public/", async () => {
    const declared = [
      ...(await readIconUrls()),
      ...(await readManifest()).icons.map((i) => i.src),
    ];
    expect(declared.length).toBeGreaterThan(0);

    for (const url of declared) {
      const path = join(PUBLIC, url.split("?")[0] ?? url);
      await expect(readFile(path), `${url} is declared but missing`).resolves.toBeTruthy();
    }
  });

  it("layout.tsx and site.webmanifest agree on the ?v= cache-buster", async () => {
    const declared = [
      ...(await readIconUrls()),
      ...(await readManifest()).icons.map((i) => i.src),
    ];
    const versions = new Set(declared.map((url) => url.split("?v=")[1]));

    // Undefined lands in the set if any URL forgot its buster, so this catches
    // "bumped one surface, forgot the other" and "dropped the query" alike.
    expect([...versions], "every icon URL needs the SAME ?v= value").toHaveLength(1);
    expect([...versions][0]).toMatch(/^\d+$/);
  });

  it("icon.svg is plateless and carries both inks behind a theme query", async () => {
    const svg = await readFile(join(PUBLIC, "icon.svg"), "utf8");

    expect(svg, "a plate would defeat the flip").not.toContain("<rect");
    expect(svg, "the vector is the one asset that adapts on its own").toContain(
      "prefers-color-scheme",
    );
    // Both appearances have to be in the file, or the query has nothing to switch to.
    expect(svg).toContain("#353b31");
    expect(svg).toContain("#f5f6f4");
  });

  it("layout.tsx selects the dark .ico with a media attribute", async () => {
    const block = await readIconsBlock();
    // A raster can't self-adapt, so this attribute is the whole mechanism. Drop it and
    // the browser takes the last matching icon — the dark ink, in every scheme.
    const dark = [
      ...block.matchAll(/\{[^{}]*media:\s*"\(prefers-color-scheme:\s*dark\)"[^{}]*\}/g),
    ].map((m) => m[0]);

    expect(dark, "exactly one icon entry may be dark-scheme scoped").toHaveLength(1);
    expect(dark[0]).toContain("/favicon-dark.ico");
  });

  it.each(TRANSPARENT_PNGS)("%s is a bare mark on transparency", async (name) => {
    const image = decodePng(await readFile(join(PUBLIC, name)));

    // The mark is thin loops inside a 0.8 inset, so most of the canvas is clear.
    expect(transparentShare(image)).toBeGreaterThan(0.5);
    expect(pixelAt(image, 0, 0), "corner must be fully clear").toEqual([0, 0, 0, 0]);
    // One ink, and it has to be the light one: iOS flattens alpha onto BLACK, and the
    // Android backdrops we never get to see skew dark.
    expect(inkOf(image)).toEqual([...INK_DARK]);
  });

  it(`${MASKABLE} keeps its plate (the maskable spec requires a filled canvas)`, async () => {
    const image = decodePng(await readFile(join(PUBLIC, MASKABLE)));

    expect(transparentShare(image)).toBe(0);
    expect(pixelAt(image, 0, 0)).toEqual([...PLATE, 255]);
  });

  it("favicon.ico and favicon-dark.ico are a real pair", async () => {
    const light = decodeIco(await readFile(join(PUBLIC, "favicon.ico")));
    const dark = decodeIco(await readFile(join(PUBLIC, "favicon-dark.ico")));

    for (const [label, images] of [
      ["favicon.ico", light],
      ["favicon-dark.ico", dark],
    ] as const) {
      expect(images.map((i) => i.width), label).toEqual([16, 32, 48]);
      for (const image of images) {
        expect(pixelAt(image, 0, 0), `${label} ${image.width}px corner`).toEqual([0, 0, 0, 0]);
      }
    }

    // The point of the pair. Two files with the same ink would pass everything above
    // while adapting to nothing.
    light.forEach((image, i) => {
      const twin = dark[i];
      expect(twin).toBeDefined();
      expect(inkOf(image), `${image.width}px light entry`).toEqual([...INK]);
      expect(inkOf(twin as Pixels), `${image.width}px dark entry`).toEqual([...INK_DARK]);
    });
  });

  it("safari-pinned-tab.svg stays a single flat path", async () => {
    const svg = await readFile(join(PUBLIC, "safari-pinned-tab.svg"), "utf8");

    // Safari discards the fill and re-colors the shape itself, so a plate here
    // would be re-colored into a solid block that hides the mark.
    expect(svg).not.toContain("<rect");
    expect(svg).not.toContain("fill=");
    expect([...svg.matchAll(/<path/g)]).toHaveLength(1);
  });
});
