/**
 * @sina-design-system/core — charts/merge (internal)
 *
 * Minimal deep merge for Chart.js option objects: plain objects recurse,
 * everything else (arrays, functions, scalars) is replaced by the override.
 * Later overrides win. Inputs are never mutated.
 */

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function mergeTwo(base: PlainObject, override: PlainObject): PlainObject {
  const out: PlainObject = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const current = out[key];
    out[key] = isPlainObject(current) && isPlainObject(value) ? mergeTwo(current, value) : value;
  }
  return out;
}

/** Deep-merge overrides over a base; later arguments win. */
export function deepMerge<T extends object>(base: T, ...overrides: Array<object | undefined>): T {
  let result = base as PlainObject;
  for (const override of overrides) {
    if (override) result = mergeTwo(result, override as PlainObject);
  }
  return result as T;
}
