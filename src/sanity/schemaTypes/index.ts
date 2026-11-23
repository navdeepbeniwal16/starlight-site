import type { SchemaTypeDefinition } from "sanity";
import { landingPage, legal, siteSettings } from "./documents";
import {
  beta,
  cta,
  faq,
  faqItem,
  featureMedia,
  featureSection,
  finalCta,
  footer,
  hero,
  howItWorks,
  legalDocument,
  pricing,
  projects,
  step,
} from "./objects";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singleton documents
  landingPage,
  siteSettings,
  legal,
  // Sections
  hero,
  howItWorks,
  projects,
  beta,
  pricing,
  faq,
  finalCta,
  footer,
  // Reused building blocks
  featureSection,
  featureMedia,
  step,
  faqItem,
  cta,
  legalDocument,
];
