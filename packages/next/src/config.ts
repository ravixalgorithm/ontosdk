/**
 * Configuration schema for onto.config.ts
 * Used to dynamically generate llms.txt and other AI discovery files
 */

export type PageType = 'scoring' | 'about' | 'default';

export interface OntoRoute {
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

export interface OntoConfig {
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
export function generateLlmsTxt(config: OntoConfig): string {
  const lines: string[] = [];

  // H1: Project name (required)
  lines.push(`# ${config.name}`);
  lines.push('');

  // Blockquote: Summary (required)
  lines.push(`> ${config.summary}`);
  lines.push('');

  // Key Routes section (if provided)
  if (config.routes && config.routes.length > 0) {
    lines.push('## Key Routes');
    lines.push('');
    for (const route of config.routes) {
      const fullUrl = `${config.baseUrl}${route.path}`;
      lines.push(`- [${route.path}](${fullUrl}): ${route.description}`);
    }
    lines.push('');
  }

  // External Links section (if provided)
  if (config.externalLinks && config.externalLinks.length > 0) {
    lines.push('## Resources');
    lines.push('');
    for (const link of config.externalLinks) {
      if (link.description) {
        lines.push(`- [${link.title}](${link.url}): ${link.description}`);
      } else {
        lines.push(`- [${link.title}](${link.url})`);
      }
    }
    lines.push('');
  }

  // Custom sections (if provided)
  if (config.sections && config.sections.length > 0) {
    for (const section of config.sections) {
      lines.push(`## ${section.heading}`);
      lines.push('');
      lines.push(section.content);
      lines.push('');
    }
  }

  return lines.join('\n').trim() + '\n';
}
