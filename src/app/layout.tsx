import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  // Editable site-wide SEO from Sanity; falls back to static copy when unconfigured.
  const settings = await getSiteSettings();
  const ogImageUrl = settings?.ogImage
    ? urlForImage(settings.ogImage)?.width(1200).height(630).fit("crop").url()
    : null;

  return {
    title: settings?.siteTitle ?? siteConfig.name,
    description: settings?.metaDescription ?? siteConfig.description,
    openGraph: ogImageUrl
      ? {
          images: [
            { url: ogImageUrl, width: 1200, height: 630, alt: settings?.ogImage?.alt },
          ],
        }
      : undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
