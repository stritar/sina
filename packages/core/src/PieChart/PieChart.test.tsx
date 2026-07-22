import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DonutChart, PieChart } from "./PieChart.js";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const DATA = {
  labels: ["Alpha", "Beta", "Gamma", "Delta"],
  datasets: [{ data: [40, 25, 20, 15] }],
};

describe("PieChart", () => {
  it("renders a labelled figure with an aria-hidden canvas and no axe violations", async () => {
    const { container } = render(
      <PieChart data={DATA} label="Share by segment, four segments" className="h-40" />,
    );
    expect(screen.getByRole("img", { name: "Share by segment, four segments" })).toBeTruthy();
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders safely with no data", () => {
    const { container } = render(
      <PieChart data={{ labels: [], datasets: [] }} label="Empty pie" className="h-40" />,
    );
    expect(screen.getByRole("img", { name: "Empty pie" })).toBeTruthy();
    expect(container.querySelector("canvas")).toBeTruthy();
  });
});

describe("DonutChart", () => {
  it("renders the center label as real text and stays axe-clean", async () => {
    const { container } = render(
      <DonutChart
        data={DATA}
        label="Share by segment with total"
        centerLabel="100"
        centerSubLabel="total"
        className="h-40"
      />,
    );
    expect(screen.getByRole("img", { name: "Share by segment with total" })).toBeTruthy();
    expect(container.textContent).toContain("100");
    expect(container.textContent).toContain("total");
    expect(await axe(container)).toHaveNoViolations();
  });
});
