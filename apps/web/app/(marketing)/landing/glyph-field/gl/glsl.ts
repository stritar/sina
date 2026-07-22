// WebGL2 (GLSL ES 3.00) shader sources for the GPU glyph-field.
//
// Two passes, both drawn as a single full-screen triangle (no vertex buffer —
// positions come from gl_VertexID):
//
//   1. FIELD_FRAG   — runs at CELL resolution (one fragment per grid cell).
//      A GLSL port of field.ts (domain-warp + density/flow fBm + accent hash),
//      packed into RGBA8: R = glyph atlas index / 255, G = alpha,
//      B = accent flag (>0.5 → accent color), A = 1.
//   2. COMPOSITE_FRAG — runs at DEVICE resolution. Reads the cell texture
//      (NEAREST), looks up the glyph tile in the atlas (LINEAR), and paints the
//      glyph color over the background. Writes an opaque frame (no blending).
//
// Coordinate convention (kept identical across both passes so a screen cell maps
// to the same cell texel): everything lives in GL bottom-up space. gl_FragCoord
// gives col/row in the field pass and, divided by DPR/cellPx, in the composite.
// The atlas is drawn top-down in a 2D canvas, so the composite samples it at
// (localU, 1 - localV) to render glyphs upright.

/** Full-screen triangle; no attributes. drawArrays(TRIANGLES, 0, 3). */
export const FULLSCREEN_VERT = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

// Canonical Ashima/Gustavson simplex noise (public domain) + fBm + the integer
// accent hash ported from field.ts's hash2. Shared by the field pass.
const NOISE_LIB = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// fBm matching noise.ts: 0.5 amp start, halving amp / doubling freq, normalized.
float fbmInst(vec3 pos, vec3 off, int octaves) {
  float sum = 0.0, amp = 0.5, freq = 1.0, norm = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    sum += amp * snoise(pos * freq + off);
    norm += amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return sum / max(norm, 1.0);
}

// Integer hash → [0,1), ported bit-for-bit from field.ts hash2 (uint mod 2^32).
float hash2(float gx, float gy) {
  uint x = uint(int(gx));
  uint y = uint(int(gy));
  uint h = (x * 374761393u) ^ (y * 668265263u);
  h = (h ^ (h >> 13u)) * 1274126177u;
  h = h ^ (h >> 16u);
  return float(h) / 4294967296.0;
}
`;

export const FIELD_FRAG = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

uniform float uTime;
uniform float uFlowScale, uDensityScale, uTimeSpeed, uTurbulence, uWarp, uDrift;
uniform int   uOctaves;
uniform float uAccentRatio, uBlankThreshold, uBlockThreshold, uMinOpacity;
uniform float uCellSize, uPointerInfluence, uPointerRadius, uPointerActive;
uniform vec2  uPointer;                 // cursor in bottom-up cell units
uniform int   uDirBase, uDirCount, uBlockBase, uBlockCount, uBgIndex, uBuckets;
uniform vec3  uOffFlow, uOffDensity, uOffWarp, uOffAccent;

out vec4 outColor;

${NOISE_LIB}

const float PI = 3.14159265358979;

float smooth01(float e0, float e1, float x) {
  float t = clamp((x - e0) / max(e1 - e0, 1e-6), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  float gx = floor(gl_FragCoord.x);
  float gy = floor(gl_FragCoord.y);

  float tv = uTime * uTimeSpeed;
  float ox = uDrift * uTime;

  // Domain warp (single-octave noise, screen-locked — no drift on the warp).
  float wx = 0.0, wy = 0.0;
  if (uWarp > 0.0) {
    wx = uWarp * snoise(vec3((gx + 31.0) * uDensityScale, (gy + 17.0) * uDensityScale, tv) + uOffWarp);
    wy = uWarp * snoise(vec3((gx - 23.0) * uDensityScale, (gy + 41.0) * uDensityScale, tv) + uOffWarp);
  }

  // Density / value field.
  float dfx = (gx + ox) * uDensityScale + wx;
  float dfy = gy * uDensityScale + wy;
  float v = 0.5 + 0.5 * fbmInst(vec3(dfx, dfy, tv * 0.6), uOffDensity, uOctaves);

  // Flow angle field.
  float ffx = (gx + ox) * uFlowScale + wx;
  float ffy = gy * uFlowScale + wy;
  float a = 0.5 + 0.5 * fbmInst(vec3(ffx, ffy, tv), uOffFlow, uOctaves);
  float theta = a * PI * uTurbulence;

  // Accent channel: uniform hash drifted by a slow field, fract keeps it uniform.
  float accent = hash2(gx, gy) + 0.5 * snoise(vec3(gx * 0.1, gy * 0.1, tv * 0.5) + uOffAccent);
  accent = fract(accent);

  // Pointer influence: brighten + curl near the cursor.
  if (uPointerActive > 0.5 && uPointerInfluence > 0.0) {
    vec2 d = vec2(gx, gy) - uPointer;
    float radiusCells = max(1.0, uPointerRadius / uCellSize);
    float f = 1.0 - smooth01(0.0, radiusCells, length(d));
    if (f > 0.0) {
      v += f * uPointerInfluence * 0.45;
      theta += f * uPointerInfluence * atan(d.y, d.x);
    }
  }

  v = clamp(v, 0.0, 1.0);

  // --- Resolve to (glyph index, alpha, accent flag), mirroring renderer.ts ---
  int idx = 0;         // 0 = blank tile
  float alpha = 0.0;

  if (v < uBlankThreshold) {
    if (uBgIndex >= 0) {
      alpha = mix(0.0, uMinOpacity, v / max(uBlankThreshold, 1e-6));
      if (alpha >= 0.012) idx = uBgIndex;
      else alpha = 0.0;
    }
  } else if (v > uBlockThreshold) {
    float k = smooth01(uBlockThreshold, 1.0, v);
    int bi = int(min(float(uBlockCount - 1), floor(k * float(uBlockCount))));
    idx = uBlockBase + bi;
    alpha = mix(0.65, 1.0, k);
  } else {
    float folded = mod(theta, PI);           // undirected: [0, PI)
    int di = int(mod(floor((folded / PI) * float(uBuckets) + 0.5), float(uBuckets)));
    idx = uDirBase + (di - (di / uDirCount) * uDirCount);   // di % uDirCount
    alpha = mix(uMinOpacity, 1.0, smooth01(uBlankThreshold, uBlockThreshold, v));
  }

  float accentFlag = accent > (1.0 - uAccentRatio) ? 1.0 : 0.0;
  outColor = vec4(float(idx) / 255.0, clamp(alpha, 0.0, 1.0), accentFlag, 1.0);
}
`;

export const COMPOSITE_FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D uField;      // NEAREST — per-cell (index, alpha, accent)
uniform sampler2D uAtlas;      // LINEAR — glyph coverage in the alpha channel
uniform vec2  uResolution;     // device px
uniform float uDpr;
uniform float uCellPx;         // CSS px per cell
uniform vec2  uGrid;           // cols, rows (field texture size)
uniform vec2  uAtlasTiles;     // tilesPerRow, tileRows
uniform vec3  uBg, uPrimary, uAccent;

out vec4 outColor;

void main() {
  vec2 cell = (gl_FragCoord.xy / uDpr) / uCellPx;
  vec2 ij = floor(cell);
  vec2 fuv = fract(cell);

  vec2 texUV = (ij + 0.5) / uGrid;
  vec4 packed = texture(uField, texUV);

  int idx = int(packed.r * 255.0 + 0.5);
  float alpha = packed.g;

  if (idx == 0 || alpha < 0.004) {
    outColor = vec4(uBg, 1.0);
    return;
  }

  // Atlas tile for this glyph index; sample upright (flip local V).
  float tilesPerRow = uAtlasTiles.x;
  float tileCol = mod(float(idx), tilesPerRow);
  float tileRow = floor(float(idx) / tilesPerRow);
  vec2 tileOrigin = vec2(tileCol, tileRow) / uAtlasTiles;
  vec2 local = vec2(fuv.x, 1.0 - fuv.y) / uAtlasTiles;
  float cov = texture(uAtlas, tileOrigin + local).a;

  vec3 glyphColor = packed.b > 0.5 ? uAccent : uPrimary;
  outColor = vec4(mix(uBg, glyphColor, cov * alpha), 1.0);
}
`;
