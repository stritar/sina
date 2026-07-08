import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import type { Root } from "fumadocs-core/page-tree";
import type { TOCItemType } from "fumadocs-core/toc";

// Sidebar reads the active route via usePathname; mock it (no Next router in vitest).
vi.mock("next/navigation", () => ({ usePathname: () => "/docs" }));

import { Sidebar } from "./Sidebar";
import { DocsTOC } from "./DocsTOC";
import { ThemeToggle } from "./ThemeToggle";

// A nested tree (folders + pages) mirrors the real six-section IA so the recursive
// TreeNode rendering is exercised, not just a flat list.
const tree: Root = {
  name: "Documentation",
  children: [
    { type: "page", name: "Introduction", url: "/docs" },
    {
      type: "folder",
      name: "Getting Started",
      index: { type: "page", name: "The One Invariant", url: "/docs/getting-started/the-one-invariant" },
      children: [
        { type: "page", name: "Quickstart", url: "/docs/getting-started/quickstart" },
      ],
    },
    {
      type: "folder",
      name: "Concepts",
      children: [
        { type: "page", name: "Threat Model", url: "/docs/concepts/threat-model" },
        { type: "page", name: "The Interception Contract", url: "/docs/concepts/interception-contract" },
      ],
    },
  ],
} as unknown as Root;

const toc: TOCItemType[] = [
  { title: "Why it cannot break", url: "#why-it-cannot-break", depth: 2 },
  { title: "Validate, then mount", url: "#validate-then-mount", depth: 2 },
  { title: "A detail", url: "#a-detail", depth: 3 },
];

describe("docs chrome a11y", () => {
  it("Sidebar (in a nav landmark) has no axe violations and marks the active page", async () => {
    const { container } = render(
      <nav aria-label="Documentation">
        <Sidebar tree={tree} />
      </nav>,
    );
    // Active route gets aria-current="page".
    const active = container.querySelector('a[aria-current="page"]');
    expect(active?.textContent).toBe("Introduction");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("DocsTOC has no axe violations", async () => {
    const { container } = render(<DocsTOC items={toc} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("DocsTOC renders nothing for an empty toc", () => {
    const { container } = render(<DocsTOC items={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("ThemeToggle has no axe violations and exposes a labelled pressed state", async () => {
    const { container, getByRole } = render(<ThemeToggle />);
    const button = getByRole("button");
    // Labelled for screen readers and carries a pressed state (toggle semantics).
    expect(button.getAttribute("aria-label")).toBeTruthy();
    expect(button.getAttribute("aria-pressed")).not.toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });
});
