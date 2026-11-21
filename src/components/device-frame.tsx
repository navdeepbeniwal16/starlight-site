import type { ReactNode } from "react";

// A warm phone frame shared by every framed media block. The screen is `relative`
// with a phone aspect ratio so callers can drop in a `fill` image — or, later, a
// looping clip — into the reserved space without touching the layout.
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
