import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import "./globals.css";

// Warm Editorial typography: Fraunces for display, Inter for body. Both are
// variable fonts, so no per-weight loading is needed.
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
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
