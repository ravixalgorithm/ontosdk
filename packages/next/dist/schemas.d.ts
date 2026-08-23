import '@ontosdk/core/clean';
import { OntoConfig } from './config.js';

/**
 * JSON-LD Schema generators for automatic structured data injection
 * Follows Schema.org standards for AI-friendly metadata
 */

/**
 * Standard AIO (AI Optimization) scoring methodology
 * Based on the Onto scoring algorithm:
 * - React Tax (Efficiency): 40% (Step 1)
 * - Semantic Richness: 35% (Step 2)
 * - Content Negotiation: 25% (Step 3)
 */
interface AIOMethodologySchema {
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
declare function generateAIOMethodologySchema(config: OntoConfig, pageUrl: string): AIOMethodologySchema;
/**
 * Organization schema for About pages
 */
interface OrganizationSchema {
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
declare function generateOrganizationSchema(config: OntoConfig, pageUrl: string): OrganizationSchema | null;
/**
 * AboutPage schema combining Organization and WebPage
 */
interface AboutPageSchema {
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
declare function generateAboutPageSchema(config: OntoConfig, pageUrl: string): AboutPageSchema;
/**
 * Determine which schema to generate based on page type
 */
declare function generateSchemaForPageType(pageType: 'scoring' | 'about' | 'default', config: OntoConfig, pageUrl: string): any | null;
/**
 * Serialize schema to JSON-LD script tag content
 */
declare function serializeSchema(schema: any | null): string | null;

export { type AIOMethodologySchema, type AboutPageSchema, type OrganizationSchema, generateAIOMethodologySchema, generateAboutPageSchema, generateOrganizationSchema, generateSchemaForPageType, serializeSchema };
