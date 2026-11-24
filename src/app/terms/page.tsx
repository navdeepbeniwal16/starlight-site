import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { getLandingPage, getLegal, getSiteSettings } from "@/sanity/lib/fetch";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms",
    description:
      "The terms for using the Starlight site and joining the iOS beta or launch waitlist.",
  };
}

export default async function TermsPage() {
  const [legal, page, settings] = await Promise.all([
    getLegal(),
    getLandingPage(),
    getSiteSettings(),
  ]);
  return (
    <LegalPage
      title="Terms"
      doc={legal?.terms ?? null}
      footer={page?.footer ?? null}
      supportEmail={settings?.supportEmail}
    />
  );
}
