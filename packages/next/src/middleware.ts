import { NextRequest, NextResponse } from 'next/server';
import { matchBot } from './bots';
import { generateLlmsTxt, OntoConfig } from './config';
import { SDK_VERSION } from './version';

export async function ontoMiddleware(request: any, config?: OntoConfig) {
    const userAgent = request.headers.get('user-agent');
    const url = request.nextUrl.clone();
    const matched = matchBot(userAgent);

    const accept = request.headers.get('accept') || '';
    const hasDebugParam = request.nextUrl.searchParams.has('onto');

    const isAiBot = !!matched;
    const isMarkdownRequested = accept.includes('text/markdown') || hasDebugParam;

    // Common logic for bot/markdown negotiation
    if (isAiBot || isMarkdownRequested) {
        // Ignore internal next.js requests
        if (url.pathname.startsWith('/_next')) {
            return NextResponse.next();
        }

        // --- llms.txt Auto-Discovery ---
        if (url.pathname === '/llms.txt') {
            try {
                if (config) {
                    const llmsTxtContent = generateLlmsTxt(config);
                    const response = new NextResponse(llmsTxtContent, {
                        headers: {
                            'Content-Type': 'text/plain; charset=utf-8',
                            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
                        }
                    });
                    if (matched) response.headers.set('X-Onto-Bot', `${matched.name} (${matched.company})`);
                    response.headers.set('X-Onto-Trace', userAgent || 'no-ua');
                    return response;
                }
            } catch (error) {
                console.error('[Onto] Failed to generate llms.txt:', error);
            }
        }

        // Skip other static assets with dots — this also prevents the internal
        // subrequest below to /.onto/*.md from re-entering the bot branch.
        if (url.pathname.includes('.')) {
            return NextResponse.next();
        }

        // Determine the corresponding payload path
        let payloadPath = url.pathname;
        if (payloadPath === '/' || payloadPath === '') payloadPath = '/index';
        if (payloadPath.endsWith('/') && payloadPath !== '/') payloadPath = payloadPath.slice(0, -1);

        // --- Onto Control Plane Integration ---
        // Telemetry + injection lookups go to api.buildonto.dev (onto-api).
        // ONTO_DASHBOARD_URL is the legacy override; ONTO_API_URL is preferred.
        const ONTO_API_KEY = process.env.ONTO_API_KEY;
        const CONTROL_PLANE_URL =
            process.env.ONTO_API_URL ||
            process.env.ONTO_DASHBOARD_URL ||
            'https://api.buildonto.dev';

        if (ONTO_API_KEY) {
            // Fire-and-forget telemetry. Failures are logged but never block.
            fetch(`${CONTROL_PLANE_URL}/api/track`, {
                method: 'POST',
                headers: { 'x-onto-key': ONTO_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    route: url.pathname,
                    userAgent,
                    bot: matched?.name,
                    company: matched?.company,
                    sdkVersion: SDK_VERSION,
                })
            }).catch((err) => {
                console.error('[Onto] telemetry POST failed:', err?.message ?? err);
            });
        }

        // Fetch the pre-built static .md payload via internal subrequest. The
        // /.onto/*.md path contains a dot, so the early-return above ensures
        // this doesn't recurse through bot handling.
        const baseUrl = request.nextUrl.origin;
        const staticPayloadUrl = `${baseUrl}/.onto${payloadPath}.md`;

        let payloadBody: string;
        try {
            const payloadRes = await fetch(staticPayloadUrl);
            if (!payloadRes.ok) {
                // No pre-built .md for this route — let Next handle as HTML.
                return NextResponse.next();
            }
            payloadBody = await payloadRes.text();
        } catch (err) {
            console.error('[Onto] failed to read static payload:', err);
            return NextResponse.next();
        }

        // Pro+ feature: per-route context injection. Fetched at request time
        // so dashboard edits go live immediately (no redeploy needed). Free
        // tiers get an empty response from the API and we skip the append.
        if (ONTO_API_KEY) {
            try {
                const injRes = await fetch(
                    `${CONTROL_PLANE_URL}/api/injections?route=${encodeURIComponent(url.pathname)}`,
                    { headers: { 'x-onto-key': ONTO_API_KEY } }
                );
                if (injRes.ok) {
                    const data = await injRes.json() as { text?: string | null; label?: string | null };
                    if (data?.text) {
                        const sep = data.label
                            ? `\n\n---\n\n## ${data.label}\n\n`
                            : `\n\n---\n\n`;
                        payloadBody = `${payloadBody}${sep}${data.text}`;
                    }
                }
            } catch (err) {
                // Silent fall-through; un-injected payload is still valid.
                console.error('[Onto] injection lookup failed:', (err as Error)?.message ?? err);
            }
        }

        // Return combined response. No CDN cache so middleware (and telemetry)
        // runs on every hit.
        const headers: Record<string, string> = {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'no-store, must-revalidate',
            'Vary': 'User-Agent, Accept',
            'X-Onto-Trace': userAgent || 'no-ua',
        };
        if (matched) {
            headers['X-Onto-Bot'] = `${matched.name} (${matched.company})`;
            headers['X-Onto-Matched'] = 'true';
        }
        if (hasDebugParam) headers['X-Onto-Debug'] = 'true';

        return new NextResponse(payloadBody, { status: 200, headers });
    }

    // Default response for non-bots
    const response = NextResponse.next();

    // Add identify headers to EVERY response for clinical debugging
    response.headers.set('Vary', 'User-Agent, Accept');
    response.headers.set('X-Onto-Trace', userAgent || 'no-ua');

    // Using a safer check to avoid 'never' inference
    const detectedBot = (matched as any);
    if (detectedBot) {
        response.headers.set('X-Onto-Matched-Bot', detectedBot.name);
        response.headers.set('X-Onto-Identified', 'true');
    } else {
        response.headers.set('X-Onto-Identified', 'false');
    }

    return response;
}

// Re-export the bot registry for consumers who want to extend or inspect it
export { AI_BOT_USER_AGENTS, matchBot } from './bots';
export type { AiBot } from './bots';
