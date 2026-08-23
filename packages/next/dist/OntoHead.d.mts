import * as react_jsx_runtime from 'react/jsx-runtime';

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
declare function OntoHead(): react_jsx_runtime.JSX.Element;

export { OntoHead };
