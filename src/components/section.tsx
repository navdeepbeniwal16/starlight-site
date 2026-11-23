import type { ReactNode } from "react";

type Tone = "paper" | "beige" | "ink";

export function Section({
  tone = "paper",
  id,
  className = "",
  children,
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const band =
    tone === "ink" ? "bg-ink" : tone === "beige" ? "bg-beige" : "bg-paper";
  return (
    <section id={id} className={`${band} px-8 py-20 sm:py-28`}>
      <div className={`mx-auto w-full max-w-5xl ${className}`}>{children}</div>
    </section>
  );
}
