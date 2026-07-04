import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { KpiStat } from "./KpiStat.js";

describe("KpiStat", () => {
  it("renders the formatted value with no axe violations", async () => {
    const { container } = render(
      <KpiStat value={12500} valueFormatter={(v) => v.toLocaleString("en-US")} />,
    );
    expect(screen.getByText("12,500")).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a good trend pill for a rise and a bad one for a fall", () => {
    const { container: up } = render(<KpiStat value={120} comparisonValue={100} />);
    const upPill = up.querySelector(".pillGood");
    expect(upPill?.textContent).toContain("+20");

    const { container: down } = render(<KpiStat value={80} comparisonValue={100} />);
    const downPill = down.querySelector(".pillBad");
    expect(downPill?.textContent).toContain("-20");
  });

  it("formats the delta as a percentage when asked", () => {
    render(
      <KpiStat value={120} comparisonValue={100} showChangeAsPercentage percentageDecimalPlaces={0} />,
    );
    expect(screen.getByText("+20%")).toBeTruthy();
  });

  it("inverts good/bad when invertChangeColors is set (down is good)", () => {
    const { container } = render(<KpiStat value={80} comparisonValue={100} invertChangeColors />);
    expect(container.querySelector(".pillGood")?.textContent).toContain("-20");
    expect(container.querySelector(".pillBad")).toBeNull();
  });

  it("handles no-change, no-baseline, and null values", () => {
    const { container: equal } = render(<KpiStat value={100} comparisonValue={100} />);
    expect(equal.textContent).toContain("No change");

    const { container: noBase } = render(
      <KpiStat value={100} comparisonValue={0} showChangeAsPercentage />,
    );
    expect(noBase.textContent).toContain("No prior data");

    const { container: nul } = render(<KpiStat value={null} comparisonValue={5} />);
    expect(nul.textContent).toContain("—");
    expect(nul.querySelector(".pillGood")).toBeNull();
  });

  it("shows the comparison label beside the pill", () => {
    render(<KpiStat value={120} comparisonValue={100} comparisonLabel="vs previous period" />);
    expect(screen.getByText("vs previous period")).toBeTruthy();
  });
});
