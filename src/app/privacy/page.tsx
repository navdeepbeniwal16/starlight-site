import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getLandingPage, getLegal, getSiteSettings } from "@/sanity/lib/fetch";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy",
    description:
      "What Starlight collects when you join the beta or waitlist, who processes it, and how to have it deleted.",
  };
}

export default async function PrivacyPage() {
  const [legal, page, settings] = await Promise.all([
    getLegal(),
    getLandingPage(),
    getSiteSettings(),
  ]);
  return (
    <LegalPage
      title="Privacy"
      doc={legal?.privacy ?? null}
      footer={page?.footer ?? null}
      supportEmail={settings?.supportEmail}
    />
  );
}
