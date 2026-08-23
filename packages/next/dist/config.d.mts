/**
 * Configuration schema for onto.config.ts
 * Used to dynamically generate llms.txt and other AI discovery files
 */
type PageType = 'scoring' | 'about' | 'default';
interface OntoRoute {
    /**
     * The URL path (e.g., '/docs', '/api/reference')
     */
    path: string;
    /**
     * Description of what this route contains
     */
    description: string;
    /**
     * Optional: Page type for automatic JSON-LD schema injection
     * - 'scoring': Injects Methodology schema with AIO scoring weights (40/35/25)
     * - 'about': Injects Organization/AboutPage schema
     * - 'default': No automatic schema injection
     */
    pageType?: PageType;
}
interface OntoConfig {
    /**
     * The name of your project or site (required)
     * Used as the H1 heading in llms.txt
     */
    name: string;
    /**
     * A short summary of your project (required)
     * Displayed as a blockquote in llms.txt
     * Should contain key information necessary for understanding the rest of the file
     */
    summary: string;
    /**
     * The base URL of your site (e.g., 'https://example.com')
     */
    baseUrl: string;
    /**
     * Optional: Additional sections to include in llms.txt
     * Each section can contain any markdown content
     */
    sections?: {
        heading: string;
        content: string;
    }[];
    /**
     * Key routes that AI agents should know about
     * These will be formatted as a markdown list in llms.txt
     */
    routes?: OntoRoute[];
    /**
     * Optional: Links to external resources (documentation, API references, etc.)
     */
    externalLinks?: {
        title: string;
        url: string;
        description?: string;
    }[];
    /**
     * Optional: Organization information for JSON-LD schemas
     */
    organization?: {
        name: string;
        description?: string;
        url?: string;
        logo?: string;
        foundingDate?: string;
    };
}
/**
 * Generate llms.txt content from OntoConfig
 * Follows the llms.txt specification:
 * - H1 with project name
 * - Blockquote with summary
 * - Additional markdown sections
 */
declare function generateLlmsTxt(config: OntoConfig): string;

export { type OntoConfig, type OntoRoute, type PageType, generateLlmsTxt };
