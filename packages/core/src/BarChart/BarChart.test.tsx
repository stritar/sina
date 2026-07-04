import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { BarChart } from "./BarChart.js";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const DATA = {
  labels: ["Q1", "Q2", "Q3"],
  datasets: [
    { label: "North", data: [12, -4, 9] },
    { label: "South", data: [7, 11, 3] },
  ],
};

describe("BarChart", () => {
  it("renders a labelled figure with an aria-hidden canvas and no axe violations", async () => {
    const { container } = render(
      <BarChart data={DATA} label="Quarterly totals by region" className="h-40" />,
    );
    expect(screen.getByRole("img", { name: "Quarterly totals by region" })).toBeTruthy();
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders every orientation × stacking combination", () => {
    for (const horizontal of [false, true]) {
      for (const stacked of [false, true]) {
        const { container, unmount } = render(
          <BarChart
            data={DATA}
            horizontal={horizontal}
            stacked={stacked}
            label={`Bars ${horizontal ? "horizontal" : "vertical"} ${stacked ? "stacked" : "grouped"}`}
            className="h-40"
          />,
        );
        expect(container.querySelector("canvas")).toBeTruthy();
        unmount();
      }
    }
  });

  it("renders safely with no datasets", () => {
    const { container } = render(
      <BarChart data={{ labels: [], datasets: [] }} label="Empty bars" className="h-40" />,
    );
    expect(screen.getByRole("img", { name: "Empty bars" })).toBeTruthy();
    expect(container.querySelector("canvas")).toBeTruthy();
  });
});
