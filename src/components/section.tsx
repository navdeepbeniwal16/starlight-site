import type { ReactNode } from "react";

type Tone = "paper" | "beige";

// A full-width page section carrying the Warm Editorial rhythm: generous vertical
// space, a centred content measure, and the paper↔beige alternation later section
// tickets lean on. `rule` draws the hairline that separates adjacent bands.
export function Section({
  tone = "paper",
  rule = false,
  id,
  className = "",
  children,
}: {
  tone?: Tone;
  rule?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const band = tone === "beige" ? "bg-beige" : "bg-paper";
  const separator = rule ? "border-t border-hairline" : "";
  return (
    <section id={id} className={`${band} ${separator} px-6 py-20 sm:py-28`}>
      <div className={`mx-auto w-full max-w-5xl ${className}`}>{children}</div>
    </section>
  );
}
