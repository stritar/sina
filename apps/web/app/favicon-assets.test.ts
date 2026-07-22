import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

/**
 * Guard: the favicon set stays declared, in step, and VISIBLE.
 *
 * Three failure modes, all of which have bitten this site:
 *
 *   1. A declared icon points at a file that isn't there. Nothing warns; the tab
 *      just falls back to a letter tile.
 *   2. `app/layout.tsx` and `public/site.webmanifest` drift on the `?v=` cache-buster.
 *      Browsers cache favicons hard, so a half-bumped set means some surfaces keep
 *      showing the old artwork indefinitely.
 *   3. The artwork goes back to being a bare mark on TRANSPARENCY. This is the one
 *      that actually shipped: every asset was a #353b31 mark on alpha, adapting only
 *      via a `prefers-color-scheme` query inside icon.svg. But a favicon sits on the
 *      BROWSER CHROME, not the page, and no media query can observe the chrome's
 *      theme — `prefers-color-scheme` reports the OS. A light-OS user running a dark
 *      Chrome theme got the dark mark on a dark tab strip at ~1:1 contrast, so the
 *      icon was fetched, drawn, and invisible. The .ico and PNGs couldn't carry a
 *      query at all, and iOS composites alpha onto black.
 *
 * So the set is now plated and has exactly ONE appearance. These tests encode that:
 * the assets must be opaque, and icon.svg must carry no theme query. Regenerate with
 * `scripts/generate-favicons.mjs`, never by hand.
 */

// vitest runs with cwd = apps/web (the package root).
const WEB = process.cwd();
const PUBLIC = join(WEB, "public");

const PLATE = [0xf5, 0xf6, 0xf4] as const; // --sina-color-neutral--50

/** Assets a browser draws as-is, so they carry their own rounded plate corners. */
const ROUNDED = ["favicon.ico", "icon.svg", "icon-192.png", "icon-512.png"];
/** Assets the platform masks itself, so the plate is full-bleed and 100% opaque. */
const FULL_BLEED = ["apple-touch-icon.png", "icon-maskable-512.png"];

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

// ---------------------------------------------------------------------------

const readIconUrls = async () => {
  const layout = await readFile(join(WEB, "app", "layout.tsx"), "utf8");
  const icons = layout.slice(layout.indexOf("icons: {"), layout.indexOf("};"));
  return [...icons.matchAll(/url:\s*"([^"]+)"/g)]
    .map((m) => m[1])
    .filter((url): url is string => url !== undefined);
};

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

  it("icon.svg is plated and carries no theme query", async () => {
    const svg = await readFile(join(PUBLIC, "icon.svg"), "utf8");

    expect(svg).toMatch(/<rect[^>]*fill="#f5f6f4"/);
    // The whole point of the plate: one appearance, no dependence on a signal that
    // describes the OS rather than the browser chrome the icon actually sits on.
    expect(svg, "the favicon must not adapt to prefers-color-scheme").not.toContain(
      "prefers-color-scheme",
    );
  });

  it.each(FULL_BLEED)("%s is fully opaque (the platform supplies the mask)", async (name) => {
    const image = decodePng(await readFile(join(PUBLIC, name)));
    expect(transparentShare(image)).toBe(0);
    expect(pixelAt(image, 0, 0)).toEqual([...PLATE, 255]);
  });

  it.each(ROUNDED.filter((n) => n.endsWith(".png")))("%s sits on an opaque plate", async (name) => {
    const image = decodePng(await readFile(join(PUBLIC, name)));

    // Only the four rounded corners may be clear: rx = 20% of the side leaves
    // 4 * r^2 * (1 - pi/4), about 3.4% of the image.
    expect(transparentShare(image)).toBeLessThan(0.08);
    // Top-centre is inside the plate and clear of the mark.
    expect(pixelAt(image, image.width >> 1, Math.round(image.height * 0.08))).toEqual([
      ...PLATE,
      255,
    ]);
  });

  it("favicon.ico ships 16/32/48 and each is plated", async () => {
    const images = decodeIco(await readFile(join(PUBLIC, "favicon.ico")));

    expect(images.map((i) => i.width)).toEqual([16, 32, 48]);
    for (const image of images) {
      expect(transparentShare(image), `${image.width}px entry`).toBeLessThan(0.08);
      expect(pixelAt(image, image.width >> 1, Math.round(image.height * 0.08))).toEqual([
        ...PLATE,
        255,
      ]);
    }
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
