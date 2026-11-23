import type { LegalDocument } from "@/sanity/lib/types";
import { Footer } from "./footer";
import { Logo } from "./logo";
import { PortableText } from "./portable-text";

// Build the date in UTC so a yyyy-mm-dd string never slips a day on a machine behind UTC.
function formatUpdated(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function LegalPage({
  doc,
  supportEmail,
}: {
  doc: LegalDocument;
  supportEmail?: string | null;
}) {
  return (
    <>
      <header className="px-8 py-6">
        <div className="mx-auto max-w-5xl">
          <Logo />
        </div>
      </header>
      <main className="flex-1 px-8 py-12 sm:py-16">
        <article className="mx-auto w-full max-w-2xl">
          <h1 className="font-display text-4xl leading-tight tracking-[-0.01em] text-ink sm:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            Last updated {formatUpdated(doc.updatedAt)}
          </p>
          <div className="mt-10">
            <PortableText value={doc.body} />
          </div>
        </article>
      </main>
      <Footer content={null} supportEmail={supportEmail} />
    </>
  );
}
