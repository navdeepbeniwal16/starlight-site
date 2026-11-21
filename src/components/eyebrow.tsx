import type { ReactNode } from "react";

// Eyebrow uses gold-ink, not gold: gold fails AA as small text on light.
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.18em] text-gold-ink ${className}`}
    >
      {children}
    </p>
  );
}
