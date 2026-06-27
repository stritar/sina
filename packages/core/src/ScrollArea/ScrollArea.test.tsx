import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ScrollArea } from "./ScrollArea.js";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("ScrollArea", () => {
  it("renders its content with no axe violations", async () => {
    const { container } = render(
      <ScrollArea className="h-40 w-64">
        <ul>
          {Array.from({ length: 20 }, (_, i) => (
            <li key={i}>Row {i + 1}</li>
          ))}
        </ul>
      </ScrollArea>,
    );
    expect(screen.getByText("Row 1")).toBeDefined();
    expect(screen.getByText("Row 20")).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });
});
