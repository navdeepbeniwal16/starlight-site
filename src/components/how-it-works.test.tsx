import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { HowItWorks as HowItWorksContent } from "@/sanity/lib/types";
import { HowItWorks } from "./how-it-works";

const content: HowItWorksContent = {
  heading: "How it works",
  steps: [
    { title: "Dump", body: "Empty your head into one list." },
    { title: "Shape", body: "Pick what actually matters today." },
    { title: "Plan", body: "Slot it into a day you can finish." },
  ],
};

describe("HowItWorks", () => {
  it("renders the heading and every step in order with a numeral", () => {
    render(<HowItWorks content={content} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "How it works" }),
    ).toBeInTheDocument();

    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent("01");
    expect(steps[0]).toHaveTextContent("Dump");
    expect(steps[2]).toHaveTextContent("03");
    expect(steps[2]).toHaveTextContent("Plan");
  });
});
