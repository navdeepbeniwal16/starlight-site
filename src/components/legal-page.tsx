import type { Footer as FooterContent, LegalDocument } from "@/sanity/lib/types";
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

// Shown in place of the body when the CMS has no document: we'd rather say nothing than
// serve a stale privacy or terms policy, so there is no static fallback copy.
const UNAVAILABLE = "This page isn't available right now. Please check back soon.";

export function LegalPage({
  title,
  doc,
  footer,
  supportEmail,
}: {
  title: string;
  doc: LegalDocument | null;
  footer: FooterContent | null;
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
            {doc?.title ?? title}
          </h1>
          {doc ? (
            <>
              <p className="mt-3 text-sm text-muted">
                Last updated {formatUpdated(doc.updatedAt)}
              </p>
              <div className="mt-10">
                <PortableText value={doc.body} />
              </div>
            </>
          ) : (
            <p className="mt-6 text-base leading-7 text-muted">{UNAVAILABLE}</p>
          )}
        </article>
      </main>
      <Footer content={footer} supportEmail={supportEmail} />
    </>
  );
}
