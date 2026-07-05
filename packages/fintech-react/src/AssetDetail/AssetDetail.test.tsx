import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { assetDetailFixtures } from "@sina-design-system/fintech";

import { AssetDetail } from "./AssetDetail.js";

describe("AssetDetail", () => {
  it("has no axe violations rendering the validated payload", async () => {
    const { container } = render(<AssetDetail payload={assetDetailFixtures.valid} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations rendering the empty (no-points) payload", async () => {
    const { container } = render(<AssetDetail payload={assetDetailFixtures.validEmpty} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the name (as text) and a labelled price-trend chart", () => {
    render(<AssetDetail payload={assetDetailFixtures.valid} />);
    expect(screen.getByText("Apple Inc.")).toBeTruthy();
    expect(screen.getByRole("img", { name: /price trend/i })).toBeTruthy();
  });

  it("renders the empty state with no chart", () => {
    render(<AssetDetail payload={assetDetailFixtures.validEmpty} />);
    expect(screen.getByText("No chart data")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
