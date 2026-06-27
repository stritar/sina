import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { SummaryList } from "./SummaryList.js";
import { Badge } from "../Badge/Badge.js";

describe("SummaryList", () => {
  it("renders terms and details in a semantic dl with no axe violations", async () => {
    const { container } = render(
      <SummaryList
        items={[
          { label: "From", value: "Checking" },
          { label: "Amount", value: "4,250.00", emphasis: true },
          { label: "Status", value: <Badge intent="success">Compliant</Badge> },
        ]}
      />,
    );
    expect(container.querySelector("dl")).not.toBeNull();
    expect(container.querySelectorAll("dt").length).toBe(3);
    expect(container.querySelectorAll("dd").length).toBe(3);
    expect(screen.getByText("Compliant")).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });
});
