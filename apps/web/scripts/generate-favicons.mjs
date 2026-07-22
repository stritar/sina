/**
 * Generates the full SINA favicon set from the logo symbol (the interlocking-loop
 * mark from `app/components/docs/visuals/SinaLogo.tsx`, wordmark dropped — letterforms
 * are illegible below ~48px).
 *
 * This is a MANUAL, one-off script, deliberately not wired into `prebuild`: the
 * outputs are committed, the mark changes ~never, and `sharp` is a heavy native
 * dependency we don't want in the `apps/web` install or the Cloudflare build.
 *
 *   npm i --no-save sharp && node scripts/generate-favicons.mjs
 *
 * `SYMBOL_PATH` below is the single source of truth: the vector `icon.svg` is
 * emitted here too, so it can never drift from the rasters.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("This script needs `sharp`. Run:  npm i --no-save sharp");
  process.exit(1);
}

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..");
// Everything lands in `public/` at a stable URL and is declared explicitly in
// app/layout.tsx. These deliberately do NOT use Next's `app/icon.*` file
// convention: any `metadata.icons` key overrides that convention wholesale.
const PUBLIC = join(WEB, "public");

// The SINA mark, lifted verbatim from SinaLogo.tsx. Natural bounding box within
// its own coordinate space (measured, not guessed) — the mark is much wider than
// it is tall, so every placement below is width-bound.
const SYMBOL_PATH =
  "M20.582 4.99942C20.582 4.99966 20.5822 4.99985 20.5825 4.99985C26.8891 5.00581 31.9998 10.1206 32 16.4286C31.9999 22.4325 27.3699 27.3554 21.4857 27.8212C20.9822 27.8611 20.5713 27.4478 20.5713 26.9427C20.5713 26.4376 20.982 26.0327 21.4849 25.9853C26.3583 25.5252 30.1718 21.4223 30.1719 16.4286C30.1717 11.3292 26.1952 7.16017 21.1741 6.84916C20.9883 6.83765 20.8022 6.87079 20.6288 6.93866L11.7003 10.4339C11.6137 10.4678 11.5216 10.4852 11.4287 10.4852C8.14668 10.4852 5.48554 13.1466 5.48535 16.4286C5.48545 19.5689 7.92173 22.1407 11.0072 22.3569C11.1928 22.3699 11.3781 22.3341 11.5507 22.2646L20.0335 18.8501C20.3584 18.7193 20.5713 18.4042 20.5713 18.0539C20.5713 17.4427 19.9506 17.0274 19.3857 17.2604L11.6799 20.4392C11.5141 20.5076 11.3359 20.5457 11.1569 20.534C9.01141 20.394 7.31455 18.6094 7.31445 16.4286C7.31462 14.2878 8.94968 12.5289 11.0392 12.3327C11.1963 12.3179 11.3523 12.2873 11.4988 12.2286L20.2926 8.71076C20.3812 8.6753 20.4758 8.65708 20.5713 8.65708C24.8632 8.65708 28.3426 12.1367 28.3428 16.4286C28.3427 20.5176 25.1845 23.8671 21.1742 24.1747C21.0174 24.1867 20.8621 24.2198 20.7166 24.2796L11.9977 27.8579C11.9077 27.8949 11.8112 27.9139 11.7139 27.9139C5.42778 27.9137 0.000101463 22.7653 0 16.4286C0.000170262 10.4245 4.63036 5.5015 10.5148 5.03586C11.018 4.99604 11.4287 5.40909 11.4287 5.91391C11.4287 6.41873 11.0182 6.82341 10.5156 6.87084C5.642 7.33077 1.82829 11.4347 1.82812 16.4286C1.82822 21.564 6.14633 25.8498 11.2884 26.0755C11.4746 26.0837 11.6601 26.0472 11.8324 25.976L20.5702 22.3685C20.5707 22.3682 20.5713 22.3686 20.5713 22.3692C20.5713 22.3696 20.5716 22.37 20.5721 22.37C23.8538 22.3695 26.5146 19.7104 26.5146 16.4286C26.5145 13.2882 24.0782 10.7164 20.9927 10.5002C20.8071 10.4873 20.6219 10.523 20.4494 10.5924L11.9672 14.0049C11.6419 14.1358 11.4287 14.4513 11.4287 14.802C11.4287 15.4137 12.05 15.8295 12.6155 15.5962L20.3201 12.4179C20.4859 12.3495 20.6641 12.3115 20.8431 12.3231C22.9885 12.4631 24.6854 14.2478 24.6855 16.4286C24.6855 18.5691 23.0508 20.3259 20.9617 20.5224C20.8046 20.5372 20.6487 20.5679 20.5022 20.6265L11.7074 24.1463C11.6188 24.1818 11.5242 24.2 11.4287 24.2C7.13673 24.2 3.65733 20.7205 3.65723 16.4286C3.65741 12.2685 6.92651 8.87131 11.0357 8.66649C11.199 8.65835 11.3611 8.62741 11.5131 8.56756L20.5702 5.00321C20.5709 5.00295 20.5713 5.00231 20.5713 5.00159C20.5713 5.00063 20.5721 4.99985 20.573 4.99985C20.5746 4.99985 20.5762 4.99985 20.5778 4.99985C20.578 4.99985 20.5782 4.99982 20.5785 4.99976L20.5815 4.99901C20.5818 4.99894 20.582 4.99914 20.582 4.99942Z";
const BBOX = { x: 0, y: 4.99942, w: 32, h: 22.91448 };

// Ink and plate come from the SINA-marketing Figma file, section "favicons" (node
// 255:2615). Figma is the authority on both values; each lands on a theme token.
const INK = "#353b31"; //   --sina-color-neutral--900
const PLATE = "#f5f6f4"; // --sina-color-neutral--50
//
// EVERY asset is PLATED — an opaque light square under the dark mark — and there is
// deliberately only ONE appearance, with no theme adaptation anywhere. This replaces
// an earlier plateless set whose only adaptive asset was icon.svg, via an embedded
// `prefers-color-scheme` query. Do not reintroduce either the transparency or the
// query. The reasons are not stylistic:
//
//   1. A favicon's backdrop is the BROWSER CHROME, not the page. Chrome's theme can
//      be dark while the OS is light (and vice versa), and no CSS media query can
//      observe that — `prefers-color-scheme` reports the OS. A light-OS user on a
//      dark Chrome theme was served the dark mark on a dark tab strip at ~1:1
//      contrast, so the icon rendered invisible. That is the bug this set fixes.
//   2. The .ico, apple-touch-icon and PWA rasters can carry no query at all, so they
//      only ever had one ink regardless.
//   3. Bookmarks, history, search results, link unfurls, the iOS home screen and the
//      Android launcher all composite onto a backdrop we never get to know. Alpha
//      there is a coin flip; iOS specifically composites onto BLACK.
//
// A light plate is the right way round: on a dark tab strip it reads as a bright
// chip, and on a light one it recedes into the strip while the dark mark still
// reads. A dark plate would sit at ~1:1 against Chrome's own dark strip, doing no
// work in exactly the case being fixed.

/**
 * Centers the mark inside a `size` square, scaled so its WIDTH occupies `inset`
 * of the side. Returns the SVG transform.
 */
function place(size, inset) {
  const scale = (size * inset) / BBOX.w;
  const tx = (size - BBOX.w * scale) / 2 - BBOX.x * scale;
  const ty = (size - BBOX.h * scale) / 2 - BBOX.y * scale;
  return `translate(${tx.toFixed(4)} ${ty.toFixed(4)}) scale(${scale.toFixed(6)})`;
}

// Corner radius of the plate, as a fraction of the side. Applied to the assets a
// browser draws AS-IS (the tab favicon and the `purpose: "any"` PWA icons). The
// assets the platform masks itself — apple-touch-icon and the maskable PWA icon —
// pass 0, because pre-rounding those double-rounds the corners.
const PLATE_RADIUS = 0.2;

/** A flat, single-color SVG of the mark, optionally on an opaque background. */
function markSvg({ size, ink, bg = null, inset = 0.9, radius = 0 }) {
  const backdrop = bg
    ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>`
    : "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${backdrop}<g transform="${place(size, inset)}"><path fill="${ink}" d="${SYMBOL_PATH}"/></g></svg>`;
}

const png = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size, { fit: "contain" }).png({ compressionLevel: 9 }).toBuffer();

/**
 * Packs PNGs into an .ico container. Every browser back to IE11 reads PNG-in-ICO,
 * and it keeps the 48px entry small enough to be worth shipping.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

await mkdir(PUBLIC, { recursive: true });
const written = [];
const write = async (path, data) => {
  await writeFile(path, data);
  written.push(`${path.slice(WEB.length + 1)}  (${(data.length / 1024).toFixed(1)} kB)`);
};

// 1. The vector icon. Modern browsers prefer this over the .ico at any size, so it
//    is what most people actually see in the tab.
//
//    It goes through `markSvg` like every raster below, which is the point: one
//    helper, one appearance, no way for the vector to drift from the bitmaps. The
//    earlier hand-written version reproduced the Figma frame full-bleed, keeping the
//    mark's own vertical offset (5.0 above, 4.09 below, deliberately not optically
//    centred). A plate supersedes that: the mark is now centred inside the plate,
//    and the plate is the thing bounded by the 32x32 box.
await write(join(PUBLIC, "icon.svg"), markSvg({
  size: 32,
  ink: INK,
  bg: PLATE,
  inset: 0.72,
  radius: 32 * PLATE_RADIUS,
}) + "\n");

// 2. favicon.ico — the legacy fallback, and what a browser requests before it has
//    parsed any HTML. Safari also prefers it over the SVG.
//
//    Plated, same as everything else. The inset drops from 0.82 to 0.72 to leave a
//    visible plate margin around the mark at 16px.
await write(
  join(PUBLIC, "favicon.ico"),
  buildIco(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({
        size,
        data: await png(
          markSvg({ size, ink: INK, bg: PLATE, inset: 0.72, radius: size * PLATE_RADIUS }),
          size,
        ),
      })),
    ),
  ),
);

// 3. iOS home screen. Plated, and SQUARE — radius 0. iOS applies its own superellipse
//    mask, so a pre-rounded asset shows the mask cutting inside our corners. The
//    plate also settles the old alpha problem: iOS composites transparency onto
//    BLACK, which used to swallow the dark mark entirely.
await write(
  join(PUBLIC, "apple-touch-icon.png"),
  await png(markSvg({ size: 180, ink: INK, bg: PLATE, inset: 0.6 }), 180),
);

// 4. Android / PWA install icons, `purpose: "any"`. An "any" icon draws straight onto
//    the launcher or task switcher with no mask applied, so it carries its own
//    rounded plate and never has to survive an unknown wallpaper.
for (const size of [192, 512]) {
  await write(
    join(PUBLIC, `icon-${size}.png`),
    await png(
      markSvg({ size, ink: INK, bg: PLATE, inset: 0.68, radius: size * PLATE_RADIUS }),
      size,
    ),
  );
}

// 5. `purpose: "maskable"` — Android crops this to an arbitrary shape (circle,
//    squircle, teardrop) and only guarantees the centre 80% circle survives. The
//    plate is full-bleed with radius 0 (the launcher supplies the shape) and the
//    mark is held to 55% of the side so no crop can clip it.
await write(
  join(PUBLIC, "icon-maskable-512.png"),
  await png(markSvg({ size: 512, ink: INK, bg: PLATE, inset: 0.55 }), 512),
);

// 6. Safari pinned tab / Touch Bar: a strictly monochrome vector. Safari discards
//    the fill and re-colors the shape itself, so the color here is irrelevant —
//    but the file must be a single flat layer with no styles.
await write(
  join(PUBLIC, "safari-pinned-tab.svg"),
  `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g transform="${place(16, 0.95)}"><path d="${SYMBOL_PATH}"/></g></svg>\n`,
);

console.log(`Wrote ${written.length} icon assets:\n${written.map((w) => `  ${w}`).join("\n")}`);
console.log(`\nMark ${INK} on an opaque ${PLATE} plate. One appearance, no theme adaptation.`);
console.log("Remember to bump the ?v= cache-buster in app/layout.tsx AND public/site.webmanifest.");
