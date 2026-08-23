'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import type { OntoConfig, PageType } from './config';
import { generateSchemaForPageType, serializeSchema } from './schemas';

export interface OntoProviderProps {
  /**
   * The base URL of your site (e.g., 'https://example.com')
   * Used to construct the full href for the AI discovery link tag.
   */
  baseUrl: string;
  /**
   * Child components to render
   */
  children: ReactNode;
  /**
   * Optional: Onto configuration for automatic JSON-LD schema injection
   * If provided, the provider will automatically inject JSON-LD schemas
   * based on the page type configuration
   */
  config?: OntoConfig;
}

/**
 * OntoProvider — Automatic AI Discovery Provider
 *
 * Wraps your application and automatically injects:
 * 1. `<link rel="alternate">` tags for AI discovery
 * 2. JSON-LD structured data schemas based on page type
 *
 * With config, automatically generates JSON-LD schemas:
 * - 'scoring' pages get Methodology schema with AIO weights (40/35/25)
 * - 'about' pages get Organization/AboutPage schema
 *
 * Usage in a Next.js App Router layout:
 * ```tsx
 * import { OntoProvider } from '@ontosdk/next/provider';
 * import config from '../onto.config';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <OntoProvider baseUrl="https://example.com" config={config}>
 *       <html>
 *         <head />
 *         <body>{children}</body>
 *       </html>
 *     </OntoProvider>
 *   );
 * }
 * ```
 */
export function OntoProvider({ baseUrl, children, config }: OntoProviderProps) {
  const pathname = usePathname();

  // Construct the full URL with the current path and ?format=md query string
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const markdownHref = `${cleanBaseUrl}${pathname}?format=md`;
  const fullPageUrl = `${cleanBaseUrl}${pathname}`;

  // Determine page type from config routes
  const pageType: PageType = useMemo(() => {
    if (!config?.routes) return 'default';

    const matchingRoute = config.routes.find(route => route.path === pathname);
    return matchingRoute?.pageType || 'default';
  }, [config, pathname]);

  // Generate JSON-LD schema based on page type
  const jsonLdSchema = useMemo(() => {
    if (!config || pageType === 'default') return null;

    const schema = generateSchemaForPageType(pageType, config, fullPageUrl);
    return serializeSchema(schema);
  }, [config, pageType, fullPageUrl]);

  return (
    <>
      <link
        rel="alternate"
        type="text/markdown"
        href={markdownHref}
        title="AI-optimized Markdown version"
      />
      {jsonLdSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSchema }}
        />
      )}
      {children}
    </>
  );
}
