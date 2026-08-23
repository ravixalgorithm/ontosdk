import { ontoMiddleware as middleware } from '@ontosdk/next/middleware';
export { middleware };

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - api
         * - _next
         * - static files
         */
        '/((?!api|_next|.*\\..*).*)',
    ],
};
