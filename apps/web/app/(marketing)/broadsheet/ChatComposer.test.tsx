import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Microphone, PlusCircle, Waveform } from "@phosphor-icons/react/dist/ssr";
import { ChatComposer } from "./ChatComposer";

/**
 * The composer is one bordered field that contains everything, and only one
 * thing inside it is real: the send button. The leading (attach) and trailing
 * (voice) glyphs are decoration on an aria-hidden display-only field, so they
 * must never become a second tab stop or a second accessible name — that is the
 * difference between this and a genuine chat input, and it is easy to lose.
 */
const send = { sendIcon: <Waveform weight="bold" />, sendLabel: "Send" };

describe("ChatComposer", () => {
  it("renders both decorative glyph slots when the caller passes them", () => {
    const { container } = render(
      <ChatComposer
        {...send}
        placeholder="Ask the agent for something"
        leadingIcon={<PlusCircle weight="fill" />}
        trailingIcon={<Microphone weight="fill" />}
      />,
    );

    // Three glyphs total: leading, trailing, and the one inside the button.
    expect(container.querySelectorAll("svg")).toHaveLength(3);
  });

  it("omits the slots entirely when no glyph is passed", () => {
    const { container } = render(<ChatComposer {...send} placeholder="Ask" />);

    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("keeps every glyph and the text inert, leaving the send button the only control", () => {
    const { container, getByRole } = render(
      <ChatComposer
        {...send}
        text="Wire $60,000 from Acme Corp"
        caret
        leadingIcon={<PlusCircle weight="fill" />}
        trailingIcon={<Microphone weight="fill" />}
      />,
    );

    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(getByRole("button", { name: "Send" })).toBeTruthy();

    // The field surface itself: the marker the hero styles through, and the
    // marker that earns the global blue focus outline.
    const root = container.firstElementChild;
    expect(root?.hasAttribute("data-composer")).toBe(true);
    expect(root?.hasAttribute("data-broadsheet")).toBe(true);

    // Nothing decorative leaks into the accessibility tree.
    for (const slot of container.querySelectorAll("[data-composer] > span")) {
      expect(slot.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("carries the size axis onto the root so the per-size rules resolve", () => {
    const { container } = render(<ChatComposer {...send} size="lg" placeholder="Ask" />);

    expect(container.firstElementChild?.getAttribute("data-size")).toBe("lg");
  });
});
