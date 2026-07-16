import { beforeAll, describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import type { Root } from "fumadocs-core/page-tree";
import type { TOCItemType } from "fumadocs-core/toc";

// Sidebar reads the active route via usePathname; mock it (no Next router in vitest).
vi.mock("next/navigation", () => ({ usePathname: () => "/docs" }));

// The toolbar + pager derive breadcrumb/neighbours from the real page tree; a
// two-page stub keeps the generated `.source` output out of the test run.
// `getPageTree(locale)` is the i18n-aware accessor (the tree is per-locale now).
vi.mock("@/lib/source", () => ({
  source: {
    getPageTree: () => ({
      name: "Documentation",
      children: [
        { type: "page", name: "Quickstart", url: "/docs/quickstart" },
        { type: "page", name: "For AI agents", url: "/docs/for-ai-agents" },
      ],
    }),
  },
}));

beforeAll(() => {
  // Radix's floating content measures + captures pointers; jsdom implements neither.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

import { Sidebar } from "./Sidebar";
import { DocsTOC } from "./DocsTOC";
import { ThemeToggle } from "./ThemeToggle";
import { CopyPageMenu } from "./CopyPageMenu";
import { DocsArticle } from "./DocsArticle";
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
  SameModelDiagram,
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

  it("ThemeToggle is a segmented radiogroup that sets and persists the theme", async () => {
    const user = userEvent.setup();
    // This env exposes no localStorage (the component tolerates that via try/catch,
    // but the test needs a real store to assert the choice is persisted).
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });

    const { container, getByRole } = render(<ThemeToggle />);

    // Three visible segments (system/light/dark), single-select — a radiogroup,
    // not a cycle button. Showing all three at once is the point of the redesign.
    getByRole("radiogroup", { name: "Theme" });
    const system = getByRole("radio", { name: "Follow system" });
    const light = getByRole("radio", { name: "Light" });
    const dark = getByRole("radio", { name: "Dark" });

    // Defaults to following the OS.
    expect(system.getAttribute("aria-checked")).toBe("true");
    expect(await axe(container)).toHaveNoViolations();

    // Clicking a segment sets it directly (no cycling), stamps <html>, and persists.
    await user.click(dark);
    expect(dark.getAttribute("aria-checked")).toBe("true");
    expect(store.get("sina-docs-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    await user.click(light);
    expect(light.getAttribute("aria-checked")).toBe("true");
    expect(store.get("sina-docs-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    vi.unstubAllGlobals();
  });

  it("CopyPageMenu has no axe violations and copies the page's raw markdown", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("# Quickstart\n")));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });

    const { container, getByRole } = render(
      <CopyPageMenu markdownUrl="/llms/docs/quickstart.md" />,
    );
    expect(await axe(container)).toHaveNoViolations();

    // The left segment fetches the pre-generated .md asset — it never re-derives
    // the markdown, which is what keeps the site free of a Node-runtime route.
    await user.click(getByRole("button", { name: /copy page/i }));
    expect(fetch).toHaveBeenCalledWith("/llms/docs/quickstart.md");
    expect(writeText).toHaveBeenCalledWith("# Quickstart\n");

    vi.unstubAllGlobals();
  });

  it("CopyPageMenu's caret opens a menu with the markdown + agent hand-off items", async () => {
    const user = userEvent.setup();
    const { getByRole, getAllByRole } = render(
      <CopyPageMenu markdownUrl="/llms/docs/quickstart.md" />,
    );

    await user.click(getByRole("button", { name: "More page actions" }));
    const items = getAllByRole("menuitem");
    expect(items.map((i) => i.textContent)).toEqual(["View as Markdown", "Open in Claude"]);
    // "View as Markdown" is a real link to the static asset, not a JS handler.
    expect(items[0]!.getAttribute("href")).toBe("/llms/docs/quickstart.md");
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
        <SameModelDiagram />
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

describe("docs article structure", () => {
  // `.prose` styles MDX by element selector (`.prose ol`, `.prose a`, …), which
  // outranks a chrome component's own single-class rules. Chrome rendered inside
  // it silently inherits content styling — that is what indented the breadcrumb
  // by the `.prose ol/li` padding and underlined its link via `.prose a`.
  const page = {
    url: "/docs/for-ai-agents",
    data: {
      title: "For AI agents",
      description: "An AI can read your style guide and ignore it.",
      body: () => <p>Body copy.</p>,
      toc: [],
    },
  } as unknown as Parameters<typeof DocsArticle>[0]["page"];

  it("keeps the toolbar and pager outside the .prose scope", () => {
    const { container } = render(<DocsArticle page={page} />);

    const prose = container.querySelector(".prose");
    expect(prose).not.toBeNull();
    expect(prose!.querySelector('nav[aria-label="Breadcrumb"]')).toBeNull();
    expect(prose!.querySelector('nav[aria-label="Docs pagination"]')).toBeNull();

    // Still rendered — as siblings of the prose body, not descendants of it.
    expect(container.querySelector('nav[aria-label="Breadcrumb"]')).not.toBeNull();
    expect(container.querySelector('nav[aria-label="Docs pagination"]')).not.toBeNull();
  });

  it("wraps the MDX body in .prose so authored content keeps its typography", () => {
    const { container } = render(<DocsArticle page={page} />);

    expect(container.querySelector(".prose p")?.textContent).toBe("Body copy.");
  });
});
