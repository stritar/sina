import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./Toast.js";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Toast", () => {
  it("renders an open toast with status semantics and no axe violations", async () => {
    const { container } = render(
      <ToastProvider>
        <Toast variant="success" open>
          <div>
            <ToastTitle>Transfer authorized</ToastTitle>
            <ToastDescription>Wire queued.</ToastDescription>
          </div>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.getByText("Transfer authorized")).toBeDefined();
    const status = screen.getByRole("status");
    expect(status).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });
});
