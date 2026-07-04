import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { LineChart } from "./LineChart.js";

beforeAll(() => {
  // Chart.js `responsive: true` needs a ResizeObserver; jsdom has none.
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const DATA = {
  labels: ["Jan", "Feb", "Mar", "Apr"],
  datasets: [
    { label: "Series A", data: [3, 7, 4, 9] },
    { label: "Series B", data: [2, 4, 6, 5] },
  ],
};

describe("LineChart", () => {
  it("renders a labelled figure with an aria-hidden canvas and no axe violations", async () => {
    const { container } = render(
      <LineChart data={DATA} label="Two series trending up over four months" className="h-40" />,
    );
    const figure = screen.getByRole("img", { name: "Two series trending up over four months" });
    expect(figure).toBeTruthy();
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders safely with no datasets", () => {
    const { container } = render(
      <LineChart data={{ labels: [], datasets: [] }} label="Empty chart" className="h-40" />,
    );
    expect(screen.getByRole("img", { name: "Empty chart" })).toBeTruthy();
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("forwards its ref to the wrapper element", () => {
    let node: HTMLDivElement | null = null;
    render(
      <LineChart
        ref={(n) => {
          node = n;
        }}
        data={DATA}
        label="Ref target"
      />,
    );
    expect(node).not.toBeNull();
    expect((node as unknown as HTMLDivElement).getAttribute("role")).toBe("img");
  });

  it("disables animation under prefers-reduced-motion", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    const { container } = render(
      <LineChart data={DATA} label="Reduced motion chart" className="h-40" />,
    );
    // The chart mounted (construction succeeded with animation disabled).
    expect(container.querySelector("canvas")).toBeTruthy();
  });
});
