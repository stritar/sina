import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";

// The nav's LanguageSwitcher reads the route; no Next router exists in vitest.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

beforeAll(() => {
  // Radix dropdown (LanguageSwitcher) + dialog measure + capture pointers; jsdom has neither.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();

  // Reduced motion ON: the hero emulator never starts its auto loop; its mount
  // effect restores the completed static thread — both turns of the industry's story
  // (the pass and the escalation). The auto-play timeline itself is covered by
  // hero-emulator/useConversation.test.tsx.
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
});

import { MarketingHome } from "../MarketingHome";

describe("landing page", () => {
  it("renders the idle page with the fintech story static frame and no axe violations", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<MarketingHome locale="en" />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "governed design system",
    );
    // Fintech is the default: live tag present, no coming-soon badge.
    expect(screen.getByText("Live demo")).toBeDefined();
    expect(screen.queryByText("Coming soon")).toBeNull();

    // The static thread carries BOTH turns: the $500 wire that passes and
    // renders a confirm card, then the $60k wire that escalates to the REAL
    // SecureWireDialog. The gate rides inline in the conversation.
    expect(screen.getByText(/Send \$500 to Beta LLC/)).toBeDefined();
    expect(screen.getByText(/Wire \$60,000/)).toBeDefined();
    expect(screen.getByText("$500.00")).toBeDefined();
    expect(screen.getByText("Escalated")).toBeDefined();
    expect(screen.getByText("mount: SecureWireDialog")).toBeDefined();
    expect(screen.getByRole("button", { name: "Review and approve" })).toBeDefined();

    // The auto-loop is fully canned: the static frame never touches the network.
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("switches to the healthcare story (pass then a simulated co-sign escalation) without the network", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<MarketingHome locale="en" />);

    await user.click(screen.getByRole("radio", { name: "Healthcare" }));

    expect(screen.getByText("Coming soon")).toBeDefined();
    expect(screen.getByText("Simulated preview")).toBeDefined();
    // Pass turn: the medication read renders its component (the patient row).
    expect(screen.getByText("Maria Chen")).toBeDefined();
    // Escalation turn: the gate names the governed dialog SINA would mount,
    // openly a simulation (no fintech-react component exists for it yet).
    expect(screen.getByText("CoSignDialog")).toBeDefined();
    expect(screen.getByText("Escalated")).toBeDefined();
    expect(screen.queryByText("Live demo")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    // The tint rides on <html data-industry>, which is what industry-tint.css
    // keys on and what the glyph-field canvas watches to re-read its palette.
    expect(document.documentElement.dataset.industry).toBe("healthcare");
  });

  it("switches to the defense story (a two-person-control escalation)", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<MarketingHome locale="en" />);

    await user.click(screen.getByRole("radio", { name: "Defense" }));

    expect(screen.getByText("Coming soon")).toBeDefined();
    expect(screen.getByText("DualAuthDialog")).toBeDefined();
    expect(screen.getByText(/two person control/)).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("carries the bold warning glyph on an escalate gate (the error/warning icon rule)", async () => {
    render(<MarketingHome locale="en" />);
    // The escalate GateCard leads with a soft 'Escalated' badge that MUST carry
    // its bold status glyph beside the label — never fill + text alone.
    const escalated = screen.getByText("Escalated");
    const badge = escalated.closest("[data-broadsheet]");
    expect(badge?.querySelector("svg")).not.toBeNull();
  });
});
