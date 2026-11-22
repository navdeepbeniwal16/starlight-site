import type { Metadata } from "next";
import { Caprasimo, Fraunces, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  // Editable site-wide SEO from Sanity; falls back to static copy when unconfigured.
  const settings = await getSiteSettings();
  const title = settings?.siteTitle ?? siteConfig.name;
  const description = settings?.metaDescription ?? siteConfig.description;
  const ogImageUrl = settings?.ogImage
    ? urlForImage(settings.ogImage)?.width(1200).height(630).fit("crop").url()
    : null;
  const images = ogImageUrl
    ? [{ url: ogImageUrl, width: 1200, height: 630, alt: settings?.ogImage?.alt }]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: title,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
      creator: settings?.socialHandle ?? undefined,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${caprasimo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
