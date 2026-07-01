/**
 * Tiny JSON syntax tokenizer for the CodeBlock — payloads here are small, so a
 * hand-rolled scanner beats pulling in Prism/Shiki. Scopes map to SINA semantic
 * color tokens (see CodeBlock) so highlighting reads in both light and dark.
 */

export type Scope = "key" | "string" | "number" | "boolean" | "punctuation" | "plain";

export interface Token {
  text: string;
  scope: Scope;
}

const PUNCTUATION = new Set(["{", "}", "[", "]", ",", ":"]);

function readString(line: string, start: number): number {
  // start points at the opening quote; return the index just past the closing quote
  let i = start + 1;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === '"') return i + 1;
    i += 1;
  }
  return line.length; // unterminated — treat the rest as the string
}

function isNumberStart(ch: string): boolean {
  return ch === "-" || (ch >= "0" && ch <= "9");
}

function readNumber(line: string, start: number): number {
  const match = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(line.slice(start));
  return start + (match ? match[0].length : 1);
}

function nextNonSpaceIsColon(line: string, from: number): boolean {
  let i = from;
  while (i < line.length && (line[i] === " " || line[i] === "\t")) i += 1;
  return line[i] === ":";
}

/** Tokenize a single line of pretty-printed JSON into colored segments. */
export function tokenizeJsonLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];
    if (ch === undefined) break;

    if (ch === '"') {
      const end = readString(line, i);
      const text = line.slice(i, end);
      const scope: Scope = nextNonSpaceIsColon(line, end) ? "key" : "string";
      tokens.push({ text, scope });
      i = end;
      continue;
    }

    if (isNumberStart(ch)) {
      const end = readNumber(line, i);
      tokens.push({ text: line.slice(i, end), scope: "number" });
      i = end;
      continue;
    }

    const rest = line.slice(i);
    const keyword = /^(true|false|null)\b/.exec(rest);
    if (keyword) {
      tokens.push({ text: keyword[0], scope: "boolean" });
      i += keyword[0].length;
      continue;
    }

    if (PUNCTUATION.has(ch)) {
      tokens.push({ text: ch, scope: "punctuation" });
      i += 1;
      continue;
    }

    // Plain run (whitespace / anything else) up to the next meaningful char.
    let j = i + 1;
    while (j < line.length) {
      const cj = line[j];
      if (
        cj === undefined ||
        cj === '"' ||
        isNumberStart(cj) ||
        PUNCTUATION.has(cj) ||
        /^(true|false|null)\b/.test(line.slice(j))
      ) {
        break;
      }
      j += 1;
    }
    tokens.push({ text: line.slice(i, j), scope: "plain" });
    i = j;
  }

  return tokens;
}
