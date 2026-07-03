import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
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

  it("renders a known value from the validated payload", () => {
    const { container } = render(<AssetDetail payload={assetDetailFixtures.valid} />);
    expect(container.textContent).toContain("Apple Inc.");
  });
});
