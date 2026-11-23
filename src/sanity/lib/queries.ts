import { defineQuery } from "next-sanity";

// Shared projection fragments, so the landing page and its nested showcase project
// the same shapes. `image` is projected whole (it carries its own `alt`); `video`
// collapses to a playable URL.
const CTA = `cta{ label, kind }`;
const FEATURE_MEDIA = `featureMedia{ image, "videoUrl": video.asset->url }`;
const FEATURE_SECTION = `{ eyebrow, heading, body, ${FEATURE_MEDIA} }`;

// Singletons are fetched by type (there is only ever one of each). The `published`
// perspective on the client keeps drafts out.
export const landingPageQuery = defineQuery(`*[_type == "landingPage"][0]{
  hero{ eyebrow, heading, subheading, devicePoster, cta[]{ label, kind }, ctaFootnote },
  featureSections[]${FEATURE_SECTION},
  howItWorks{ heading, steps[]{ title, body } },
  projects{ heading, body, items[]${FEATURE_SECTION} },
  beta{ heading, body, ${CTA} },
  pricing{ heading, body, note },
  faq{ heading, items[]{ question, answer } },
  finalCta{ heading, body, ${CTA} },
  footer{ tagline },
  privacyBlurb
}`);

export const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  siteTitle,
  metaDescription,
  ogImage,
  socialHandle,
  supportEmail,
  testFlightUrl
}`);

const LEGAL_DOCUMENT = `{ title, updatedAt, body }`;
export const legalQuery = defineQuery(`*[_type == "legal"][0]{
  privacy${LEGAL_DOCUMENT},
  terms${LEGAL_DOCUMENT}
}`);
