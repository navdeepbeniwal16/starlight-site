import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legalFallback } from "@/lib/legal";
import { getLegal, getSiteSettings } from "@/sanity/lib/fetch";

// getLegal() is cached, so calling it here and in the page is one fetch, not two.
export async function generateMetadata(): Promise<Metadata> {
  const legal = await getLegal();
  return {
    title: legal?.privacy.title ?? legalFallback.privacy.title,
    description:
      "What Starlight collects when you join the beta or waitlist, who processes it, and how to have it deleted.",
  };
}

export default async function PrivacyPage() {
  const [legal, settings] = await Promise.all([getLegal(), getSiteSettings()]);
  const doc = legal?.privacy ?? legalFallback.privacy;
  return <LegalPage doc={doc} supportEmail={settings?.supportEmail} />;
}
