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
import {
  Callout,
  Card,
  CardGrid,
  Steps,
  Step,
  DoDont,
  DeepDive,
  Tabs,
  Tab,
  PropsTable,
  KeyboardTable,
  TokenSwatch,
  TokenSwatchGrid,
  FlowDiagram,
  ArchitectureDiagram,
  EnforcementLadder,
  TokenTree,
  PrimitiveAnatomy,
  BeforeAfter,
  Before,
  After,
  YouWillLearn,
  Recap,
  ComplianceNote,
  A11yBar,
  Term,
} from "./visuals";

// A nested tree (folders + pages) mirrors the real six-section IA so the recursive
// TreeNode rendering is exercised, not just a flat list.
const tree: Root = {
  name: "Documentation",
  children: [
    { type: "page", name: "Introduction", url: "/docs" },
    {
      type: "folder",
      name: "Governance",
      index: { type: "page", name: "Governance in practice", url: "/docs/governance" },
      children: [
        { type: "page", name: "Worked example: the $60k wire", url: "/docs/governance/wire-transfer" },
      ],
    },
    {
      type: "folder",
      name: "Concepts",
      children: [
        { type: "page", name: "Escalation & enforcement", url: "/docs/concepts/escalation" },
        { type: "page", name: "The interception contract", url: "/docs/concepts/the-contract" },
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

describe("docs visual kit a11y", () => {
  it("renders the full kit with no axe violations", async () => {
    const { container } = render(
      // Mirrors the `.prose` article the kit renders inside.
      <main>
        <Callout variant="governance" title="Governance note">
          <p>Every intent is validated on the server before anything mounts.</p>
        </Callout>
        <ComplianceNote />
        <A11yBar />
        <CardGrid columns={2}>
          <Card href="/docs/getting-started/quickstart" eyebrow="Frontend developer" title="Quickstart">
            Install and render a governed component.
          </Card>
          <Card href="https://example.com" title="External">
            An external link card.
          </Card>
        </CardGrid>
        <Steps>
          <Step title="Install">
            <p>Add the packages.</p>
          </Step>
          <Step title="Gate the intent">
            <Callout variant="tip">You should see a decision object.</Callout>
          </Step>
        </Steps>
        <DoDont
          do={["Lead with the problem", "Define terms on first use"]}
          dont={["Stack metaphors", "Open with the mechanism"]}
        />
        <DeepDive title="Why server-side only">
          <p>Streamed tokens cannot be un-rendered.</p>
        </DeepDive>
        <Tabs>
          <Tab label="pnpm">
            <p>pnpm add …</p>
          </Tab>
          <Tab label="npm">
            <p>npm install …</p>
          </Tab>
        </Tabs>
        <PropsTable
          rows={[
            { prop: "variant", type: '"primary" | "secondary"', default: '"primary"', description: "Visual style." },
          ]}
        />
        <KeyboardTable rows={[{ keys: "Space / Enter", description: "Activates the control." }]} />
        <TokenSwatchGrid>
          <TokenSwatch name="--sina-color-primary" note="Primary action" />
        </TokenSwatchGrid>
        <FlowDiagram highlight="block" />
        <ArchitectureDiagram />
        <EnforcementLadder />
        <TokenTree />
        <PrimitiveAnatomy parts={[{ label: "Trigger", description: "Opens the dialog." }]}>
          <pre>
            <code>{"<Dialog>…</Dialog>"}</code>
          </pre>
        </PrimitiveAnatomy>
        <BeforeAfter>
          <Before title="Ungoverned">
            <p>A raw confirm button.</p>
          </Before>
          <After title="Governed">
            <p>A forced approval dialog.</p>
          </After>
        </BeforeAfter>
        <YouWillLearn>
          <ul>
            <li>How the gate works</li>
          </ul>
        </YouWillLearn>
        <Recap>
          <p>The model proposes; the server decides.</p>
        </Recap>
        <p>
          The AI sends an <Term term="intent">intent</Term> to the gate.
        </p>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Tabs exposes one selected tab and hides the inactive panel", () => {
    const { getAllByRole } = render(
      <Tabs>
        <Tab label="pnpm">
          <p>a</p>
        </Tab>
        <Tab label="npm">
          <p>b</p>
        </Tab>
      </Tabs>,
    );
    const tabs = getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("false");
  });
});
