/**
 * JSON-LD Schema generators for automatic structured data injection
 * Follows Schema.org standards for AI-friendly metadata
 */

import { OntoConfig } from './config';

/**
 * Standard AIO (AI Optimization) scoring methodology
 * Based on the Onto scoring algorithm:
 * - React Tax (Efficiency): 40% (Step 1)
 * - Semantic Richness: 35% (Step 2)
 * - Content Negotiation: 25% (Step 3)
 */
export interface AIOMethodologySchema {
  '@context': 'https://schema.org';
  '@type': 'HowTo';
  name: string;
  description: string;
  step: Array<{
    '@type': 'HowToStep';
    name: string;
    text: string;
    position: number;
  }>;
}

/**
 * Generate AIO Scoring Methodology JSON-LD schema
 * This explains to AI agents how the scoring system works
 */
export function generateAIOMethodologySchema(
  config: OntoConfig,
  pageUrl: string
): AIOMethodologySchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'AIO Score Calculation Methodology',
    description: 'AI Optimization (AIO) Score measures how well a website is optimized for AI agents and LLM crawlers. Scored out of 100 points based on three core pillars.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'React Tax (Token Efficiency)',
        text: 'Measures the ratio of useful content to total page weight. Weight: 40%. Sites with high "React Tax" (heavy JS/HTML/CSS noise) score lower as they consume more tokens for less information.',
        position: 1
      },
      {
        '@type': 'HowToStep',
        name: 'Semantic Richness',
        text: 'Evaluates the presence of structured metadata (JSON-LD), semantic HTML tags (<main>, <article>), and proper heading hierarchy. Weight: 35%. Essential for confident AI extraction.',
        position: 2
      },
      {
        '@type': 'HowToStep',
        name: 'Content Negotiation',
        text: 'Tests whether your server can negotiate and serve optimized Markdown payloads directly to AI agents via the Accept: text/markdown header. Weight: 25%.',
        position: 3
      }
    ]
  };
}

/**
 * Organization schema for About pages
 */
export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url?: string;
  description?: string;
  logo?: string;
  foundingDate?: string;
}

/**
 * Generate Organization JSON-LD schema for About pages
 */
export function generateOrganizationSchema(
  config: OntoConfig,
  pageUrl: string
): OrganizationSchema | null {
  if (!config.organization) {
    return null;
  }

  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.organization.name
  };

  if (config.organization.url) {
    schema.url = config.organization.url;
  }

  if (config.organization.description) {
    schema.description = config.organization.description;
  }

  if (config.organization.logo) {
    schema.logo = config.organization.logo;
  }

  if (config.organization.foundingDate) {
    schema.foundingDate = config.organization.foundingDate;
  }

  return schema;
}

/**
 * AboutPage schema combining Organization and WebPage
 */
export interface AboutPageSchema {
  '@context': 'https://schema.org';
  '@type': 'AboutPage';
  name: string;
  url: string;
  description?: string;
  mainEntity?: OrganizationSchema;
}

/**
 * Generate AboutPage JSON-LD schema
 */
export function generateAboutPageSchema(
  config: OntoConfig,
  pageUrl: string
): AboutPageSchema {
  const orgSchema = generateOrganizationSchema(config, pageUrl);

  const schema: AboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${config.name}`,
    url: pageUrl
  };

  if (config.summary) {
    schema.description = config.summary;
  }

  if (orgSchema) {
    schema.mainEntity = orgSchema;
  }

  return schema;
}

/**
 * Determine which schema to generate based on page type
 */
export function generateSchemaForPageType(
  pageType: 'scoring' | 'about' | 'default',
  config: OntoConfig,
  pageUrl: string
): any | null {
  switch (pageType) {
    case 'scoring':
      return generateAIOMethodologySchema(config, pageUrl);
    case 'about':
      return generateAboutPageSchema(config, pageUrl);
    case 'default':
    default:
      return null;
  }
}

/**
 * Serialize schema to JSON-LD script tag content
 */
export function serializeSchema(schema: any | null): string | null {
  if (!schema) {
    return null;
  }
  return JSON.stringify(schema, null, 2);
}
