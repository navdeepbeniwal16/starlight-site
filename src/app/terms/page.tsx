import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalFallback } from "@/lib/legal";
import { getLegal, getSiteSettings } from "@/sanity/lib/fetch";

// getLegal() is cached, so calling it here and in the page is one fetch, not two.
export async function generateMetadata(): Promise<Metadata> {
  const legal = await getLegal();
  return {
    title: legal?.terms.title ?? legalFallback.terms.title,
    description:
      "The terms for using the Starlight site and joining the iOS beta or launch waitlist.",
  };
}

export default async function TermsPage() {
  const [legal, settings] = await Promise.all([getLegal(), getSiteSettings()]);
  const doc = legal?.terms ?? legalFallback.terms;
  return <LegalPage doc={doc} supportEmail={settings?.supportEmail} />;
}
