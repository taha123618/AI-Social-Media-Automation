export { BrandTone, BusinessModel, TonePreference } from '@/app/generated/prisma/enums';
import type { BrandTone, BusinessModel, TonePreference } from '@/app/generated/prisma/enums';

export interface BusinessProfileInput {
  mission?: string | null;
  vision?: string | null;
  uvp?: string | null;
  targetAudience?: string | null;
  tone?: string | null;
  industry?: string | null;
  forbiddenWords?: string[];
  brandTone?: BrandTone | null;
  usp?: string | null;
  colorPalette?: string[] | null;
  watermark?: string | null;
  
  // Extended Business Knowledge fields
  tagline?: string | null;
  slogan?: string | null;
  coreValues?: string[] | null;
  uniqueValueProposition?: string | null;
  businessModel?: BusinessModel | null;
  geographicMarkets?: string[] | null;
  targetAudienceDetails?: any | null;
  productsServices?: any | null; // Array of product/services with name & description
  keyBenefits?: string[] | null;
  competitiveAdvantages?: string[] | null;
  tonePreferences?: TonePreference[] | null;
}

export interface KnowledgeDocumentInput {
  name: string;
  type: string;
  key: string;
  url: string;
}