import type { ReactNode } from "react";

// The Warm Editorial eyebrow: a small, wide-tracked label above a heading. Gold-ink
// (not gold) so it stays legible as small text on light — see the palette a11y note.
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
