import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeviceFrame } from "./device-frame";

describe("DeviceFrame", () => {
  it("renders its screen content", () => {
    render(
      <DeviceFrame>
        <p>screenshot</p>
      </DeviceFrame>,
    );

    expect(screen.getByText("screenshot")).toBeInTheDocument();
  });

  it("keeps the hardware chrome out of the a11y tree", () => {
    const { container } = render(<DeviceFrame />);

    // 6 = four side buttons + the inner lip + the dynamic island, all decorative.
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(6);
  });
});
