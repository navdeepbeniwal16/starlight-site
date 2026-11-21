import type { ReactNode } from "react";

type Tone = "paper" | "beige";

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
