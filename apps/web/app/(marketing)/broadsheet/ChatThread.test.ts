/**
 * The thread's scrollability is a LAYOUT property, so jsdom (which has no
 * layout) cannot observe it: rendering the component and reading scrollHeight
 * returns 0 whether the CSS is right or wrong. This guard reads the stylesheet
 * instead and pins the one pairing that silently disabled scrolling once.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const CSS = readFileSync(join(import.meta.dirname, "ChatThread.module.css"), "utf8");

function block(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = CSS.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`no ${selector} rule in ChatThread.module.css`);
  return match[1]!.replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("ChatThread scroll box", () => {
  it("keeps the content box from collapsing into the scroll container", () => {
    const inner = block(".inner");

    // `.root` is a flex column, so `.inner` is a flex item. Clipping its block
    // overflow (to hide the 4px enter-animation transient) also opts it out of
    // the automatic minimum size, which applies only to `overflow: visible`
    // items. Left to the default `flex-shrink: 1` it then compresses to the
    // container as soon as the turns overflow, the clip hides the remainder,
    // the scroll extent stays one viewport, and the thread cannot scroll.
    if (/overflow(-y)?:\s*clip/.test(inner)) {
      expect(inner).toMatch(/flex-shrink:\s*0/);
    }

    // The floor belongs on the scroll container as a flex ITEM, not on the
    // content box, where it re-authorises exactly the collapse guarded above.
    expect(inner).not.toMatch(/min-block-size:\s*0/);
    expect(block('.root[data-size="fill"]')).toMatch(/min-block-size:\s*0/);
  });
});
