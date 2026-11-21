import type { ReactNode } from "react";

// DeviceFrame keeps its screen `relative` with a fixed aspect ratio so a `fill` child
// sits in reserved space that doesn't reflow when its contents change.
export function DeviceFrame({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.75rem] bg-frame p-2.5 shadow-device ${className}`}
    >
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.25rem] bg-screen">
        {children}
      </div>
    </div>
  );
}
