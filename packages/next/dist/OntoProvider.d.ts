import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { OntoConfig } from './config.js';

interface OntoProviderProps {
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
declare function OntoProvider({ baseUrl, children, config }: OntoProviderProps): react_jsx_runtime.JSX.Element;

export { OntoProvider, type OntoProviderProps };
