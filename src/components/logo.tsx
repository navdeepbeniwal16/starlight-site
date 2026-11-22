import { siteConfig } from "@/lib/site";

const BEAM = "M8 80C8 80 24 56 50 56C76 56 92 80 92 80";
// Mirrors public/Starlight.svg; keep the two in sync.
const STAR =
  "M12 0C12.5 6.5 17.5 11.5 24 12C17.5 12.5 12.5 17.5 12 24C11.5 17.5 6.5 12.5 0 12C6.5 11.5 11.5 6.5 12 0Z";

export function Logo({
  size = 30,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[7px] ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={BEAM}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={9}
          strokeLinecap="round"
        />
        {/* The 24-unit STAR is scaled to ~0.42 of the viewBox (1.75 × 24) and centered
            above the beam, matching the app lockup's proportions. */}
        <g transform="translate(29,5) scale(1.75)">
          <path d={STAR} fill="var(--color-ink)" />
        </g>
      </svg>
      <span
        className="font-wordmark tracking-[-0.5px] text-ink"
        style={{ fontSize: size * 0.75 }}
      >
        {siteConfig.name}
      </span>
    </span>
  );
}
