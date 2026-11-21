import { siteConfig } from "@/lib/site";

// The logo lockup: the gold four-point sparkle (the app's mark, mirrored from
// public/Starlight.svg) beside the Fraunces wordmark. The sparkle is decorative; the
// wordmark text carries the accessible name.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 0C12.5 6.5 17.5 11.5 24 12C17.5 12.5 12.5 17.5 12 24C11.5 17.5 6.5 12.5 0 12C6.5 11.5 11.5 6.5 12 0Z"
          fill="var(--color-gold)"
        />
      </svg>
      <span className="font-display text-xl tracking-[-0.01em] text-ink">
        {siteConfig.name}
      </span>
    </span>
  );
}
