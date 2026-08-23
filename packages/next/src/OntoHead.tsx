'use client';

import { usePathname } from 'next/navigation';

/**
 * OntoHead — Auto-Discovery component for AI agents.
 * 
 * Injects `<link rel="alternate">` tags into the page `<head>` so AI crawlers
 * can discover the optimized markdown endpoint for the current route.
 * 
 * Usage in a Next.js App Router layout:
 * ```tsx
 * import { OntoHead } from '@ontosdk/next/components';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <OntoHead />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 */
export function OntoHead() {
    const pathname = usePathname();

    // Map current route to its .onto markdown payload path
    let payloadPath = pathname;
    if (payloadPath === '/' || payloadPath === '') {
        payloadPath = '/index';
    }
    if (payloadPath.endsWith('/') && payloadPath !== '/') {
        payloadPath = payloadPath.slice(0, -1);
    }

    const markdownHref = `/.onto${payloadPath}.md`;

    return (
        <>
            {/* Per-page markdown alternate for AI agents */}
            <link
                rel="alternate"
                type="text/markdown"
                href={markdownHref}
                title="AI-optimized Markdown version"
            />
            {/* Site-wide llms.txt manifest */}
            <link
                rel="alternate"
                type="text/plain"
                href="/llms.txt"
                title="LLM-readable site manifest"
            />
        </>
    );
}
