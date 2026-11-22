import type { ReactNode } from "react";

// Rendered before the body, which then paints over their inner edge so only the outer
// sliver shows. The DOM order does the stacking — there's deliberately no z-index.
const SIDE_BUTTONS = [
  { side: "left", top: "19%", height: "1.6rem" },
  { side: "left", top: "28%", height: "2.9rem" },
  { side: "left", top: "40%", height: "2.9rem" },
  { side: "right", top: "32%", height: "3.9rem" },
] as const;

// DeviceFrame wraps its child in a phone mockup. The screen keeps a fixed aspect ratio so
// a `fill` child sits in reserved space that doesn't reflow when its contents change.
export function DeviceFrame({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {SIDE_BUTTONS.map((btn, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`absolute w-1 bg-[linear-gradient(90deg,var(--color-device-deep),var(--color-device-edge))] shadow-[0_1px_1px_rgb(0_0_0/0.3)] ${
            btn.side === "left"
              ? "-left-[3px] rounded-l-[3px]"
              : "-right-[3px] rounded-r-[3px]"
          }`}
          style={{ top: btn.top, height: btn.height }}
        />
      ))}

      <div className="relative rounded-[2.75rem] bg-[linear-gradient(145deg,var(--color-device-edge)_0%,var(--color-device)_48%,var(--color-device-deep)_100%)] p-2.5 shadow-device">
        {/* Screen radius = body radius − padding, so the corners nest concentrically. */}
        <div className="relative aspect-[9/19] overflow-hidden rounded-[2.125rem] bg-screen">
          {children}

          {/* A separate overlay, not a ring on the screen: a cover-image child would
              paint over an inset shadow. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.3)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-3 flex h-6 w-[31%] -translate-x-1/2 items-center justify-end rounded-full bg-[#0a0908] pr-[9px] shadow-[0_1px_2px_rgb(0_0_0/0.35)]"
          >
            <span className="h-[9px] w-[9px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#2b3550_0%,#11131b_60%,#0a0908_100%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
