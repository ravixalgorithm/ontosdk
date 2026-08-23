#!/usr/bin/env node
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { extractContent } from './extractor';
import { generateLlmsTxt, OntoConfig } from './config';
import { SDK_VERSION } from './version';

import { pathToFileURL } from 'url';

async function loadOntoConfig(): Promise<OntoConfig | null> {
    const cwd = process.cwd();
    const configPathTs = path.resolve(cwd, 'onto.config.ts');
    const configPathJs = path.resolve(cwd, 'onto.config.js');

    const tryImport = async (p: string) => {
        try {
            const config = await import(pathToFileURL(p).href);
            return config.default || config;
        } catch (e) {
            return null;
        }
    };

    // 1. Try ESM Import
    let config = await tryImport(configPathTs) || await tryImport(configPathJs);
    if (config) return config;

    // 2. Fallback: Manual Parsing (Robust for environments without TS loader)
    try {
        const filePath = fs.existsSync(configPathTs) ? configPathTs : (fs.existsSync(configPathJs) ? configPathJs : null);
        if (!filePath) return null;

        const content = fs.readFileSync(filePath, 'utf8');
        
        // Simple regex extraction for name and summary
        const nameMatch = content.match(/name\s*:\s*['"`](.*)['"`]/);
        const summaryMatch = content.match(/summary\s*:\s*['"`](.*)['"`]/);
        const baseUrlMatch = content.match(/baseUrl\s*:\s*['"`](.*)['"`]/);

        // Basic route extraction
        const routes: any[] = [];
        const routeRegex = /path\s*:\s*['"`](.*?)['"`]\s*,\s*description\s*:\s*['"`](.*?)['"`]/g;
        let match;
        while ((match = routeRegex.exec(content)) !== null) {
            routes.push({ path: match[1], description: match[2] });
        }

        if (nameMatch) {
            return {
                name: nameMatch[1],
                summary: summaryMatch ? summaryMatch[1] : '',
                baseUrl: baseUrlMatch ? baseUrlMatch[1] : '',
                routes: routes
            } as OntoConfig;
        }
    } catch (e) {
        // Fallback failed
    }

    return null;
}

// Simple helper to load .env.local from the current working directory
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) return;
            const [key, ...valueParts] = trimmedLine.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            }
        });
    }
}

async function init() {
    const cwd = process.cwd();
    const configPath = path.join(cwd, 'onto.config.ts');
    const middlewarePath = path.join(cwd, 'middleware.ts');

    console.log(pc.cyan('\n[Onto] Initializing project...'));

    // 1. Create onto.config.ts
    if (!fs.existsSync(configPath)) {
        const configTemplate = `import { OntoConfig } from '@ontosdk/next';

const config: OntoConfig = {
  name: 'My Project',
  summary: 'A short description of my project for AI agents.',
  baseUrl: 'https://example.com',
  routes: [
    { 
      path: '/', 
      description: 'The homepage of my application.',
      pageType: 'about'
    }
  ]
};

export default config;
`;
        fs.writeFileSync(configPath, configTemplate, 'utf8');
        console.log(pc.green('✓ Created') + ' onto.config.ts');
    } else {
        console.log(pc.yellow('ℹ onto.config.ts already exists, skipping.'));
    }

    // 2. Create middleware.ts
    if (!fs.existsSync(middlewarePath)) {
        const middlewareTemplate = `import { NextRequest } from 'next/server';
import { ontoMiddleware } from '@ontosdk/next/middleware';
import ontoConfig from './onto.config';

export const middleware = (req: NextRequest) => ontoMiddleware(req, ontoConfig);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
`;
        fs.writeFileSync(middlewarePath, middlewareTemplate, 'utf8');
        console.log(pc.green('✓ Created') + ' middleware.ts');
    } else {
        console.log(pc.yellow('ℹ middleware.ts already exists, skipping.'));
    }

    console.log(pc.magenta('\nInitialization complete! 🚀'));
    console.log(pc.dim('Next steps:'));
    console.log(pc.dim('1. Update your routes in onto.config.ts'));
    console.log(pc.dim('2. Run "npm run build" to generate manifests\n'));
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'init') {
        await init();
        return;
    }

    loadEnv();
    console.log(pc.cyan('\n[Onto] Starting Semantic Output Generation...'));
    // ... rest of the existing main function logic ...

    const cwd = process.cwd();
    const nextAppDirDir = path.join(cwd, '.next/server/app');
    const ontoPublicDir = path.join(cwd, 'public/.onto');

    if (!fs.existsSync(nextAppDirDir)) {
        console.log(pc.yellow(`[Onto] Could not find Next.js app output at ${nextAppDirDir}`));
        console.log(pc.yellow(`[Onto] Ensure this is run after "next build" and you are using the App Router.`));
        return;
    }

    // Find all HTML files rendered by Next.js in the app directory
    const files = await glob('**/*.html', { cwd: nextAppDirDir });

    if (files.length === 0) {
        console.log(pc.yellow(`[Onto] No static HTML files found to process.`));
        return;
    }

    // Ensure output directory exists
    if (!fs.existsSync(ontoPublicDir)) {
        fs.mkdirSync(ontoPublicDir, { recursive: true });
    }

    let totalOriginalSize = 0;
    let totalMarkdownSize = 0;
    let totalFilesProcessed = 0;

    for (const file of files) {
        const inputPath = path.join(nextAppDirDir, file);

        // glob returns OS-native paths — backslashes on Windows. The .md
        // file on disk needs path.join (OS-aware) but the URL-style route
        // recorded in the manifest must always use forward slashes,
        // otherwise the dashboard sees /compare/firecrawl from real bot
        // hits AND /compare\firecrawl from the manifest sync as two
        // distinct entries. Normalize once here, use everywhere below.
        const posixFile = file.split(path.sep).join('/');

        let outputPathRelative = file.replace(/\.html$/, '.md');
        const outputPath = path.join(ontoPublicDir, outputPathRelative);

        try {
            const htmlContent = fs.readFileSync(inputPath, 'utf8');

            const result = extractContent(htmlContent, `/${posixFile.replace(/\.html$/, '')}`);

            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            fs.writeFileSync(outputPath, result.markdown, 'utf8');

            totalOriginalSize += result.stats.originalHtmlSize;
            totalMarkdownSize += result.stats.markdownSize;
            totalFilesProcessed++;

            const origKb = (result.stats.originalHtmlSize / 1024).toFixed(1);
            const mdKb = (result.stats.markdownSize / 1024).toFixed(1);

            // /index.html -> /
            let routeName = posixFile.replace(/\.html$/, '');
            if (routeName === 'index') routeName = '/';
            else routeName = `/${routeName}`;

            console.log(
                pc.green(`✓ Optimized`) +
                pc.dim(` ${routeName} `) +
                pc.blue(`[${origKb}KB -> ${mdKb}KB]`)
            );
        } catch (e: any) {
            console.error(pc.red(`✗ Failed to process ${file}: ${e.message}`));
        }
    }

    console.log(
        pc.bold(
            pc.magenta(`Processed ${totalFilesProcessed} pages. Total Size: ${(totalOriginalSize / 1024).toFixed(1)}KB -> ${(totalMarkdownSize / 1024).toFixed(1)}KB`)
        )
    );

    // Sync manifest with Onto Control Plane.
    // ONTO_API_URL is the new canonical env var; ONTO_DASHBOARD_URL kept for
    // backward compat. Default is the deployed api.buildonto.dev (not the
    // dashboard, which isn't publicly deployed).
    const ONTO_API_KEY = process.env.ONTO_API_KEY;
    const CONTROL_PLANE_URL =
        process.env.ONTO_API_URL ||
        process.env.ONTO_DASHBOARD_URL ||
        'https://api.buildonto.dev';

    if (ONTO_API_KEY && totalFilesProcessed > 0) {
        console.log(pc.cyan(`[Onto] Syncing manifest with Control Plane [${CONTROL_PLANE_URL}]...`));
        try {
            const manifest = files.map(file => {
                // Same posix-normalization as the build loop above —
                // URL-style route fields must use forward slashes regardless
                // of OS, otherwise mixed-separator routes pollute the
                // onto_files table on Windows builds.
                const posixFile = file.split(path.sep).join('/');
                const routeName = posixFile.replace(/\.html$/, '');
                const route = routeName === 'index' ? '/' : `/${routeName}`;
                const mdPath = path.join(ontoPublicDir, file.replace(/\.html$/, '.md'));
                const htmlPath = path.join(nextAppDirDir, file);
                const content = fs.readFileSync(mdPath, 'utf8');
                // Enrich the manifest with byte counts so the dashboard can
                // compute reduction_pct accurately.
                let htmlBytes: number | undefined;
                try {
                    htmlBytes = fs.statSync(htmlPath).size;
                } catch {
                    htmlBytes = undefined;
                }
                return {
                    route,
                    // routeName is already posix-normalized above; ensures
                    // filename like "compare/firecrawl.md" not "compare\firecrawl.md"
                    filename: `${routeName}.md`,
                    content,
                    htmlBytes,
                    markdownBytes: Buffer.byteLength(content, 'utf8'),
                    sdkVersion: SDK_VERSION,
                };
            });

            const res = await fetch(`${CONTROL_PLANE_URL}/api/files`, {
                method: 'POST',
                headers: {
                    'x-onto-key': ONTO_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ files: manifest })
            });

            if (res.ok) {
                console.log(pc.green(`✓ Control Plane sync successful (${manifest.length} files)`));
            } else {
                const errData = await res.json().catch(() => ({}));
                console.log(pc.yellow(`⚠ Control Plane sync skipped: ${errData.error || res.statusText}`));
            }
        } catch (e: any) {
            console.log(pc.yellow(`⚠ Control Plane sync failed: ${e.message}`));
        }
    }

    // --- Generate llms.txt manifest ---
    const config = await loadOntoConfig();
    if (config) {
        const llmsTxtContent = generateLlmsTxt(config);
        const llmsTxtPath = path.join(cwd, 'public/llms.txt');
        
        // Ensure public dir exists
        const publicDir = path.join(cwd, 'public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        fs.writeFileSync(llmsTxtPath, llmsTxtContent, 'utf8');
        console.log(pc.green('✓ Generated') + pc.dim(' /llms.txt'));
    }

    console.log(pc.dim(`Edge payloads are ready at /public/.onto/*\n`));
}

main().catch(e => {
    console.error(pc.red(`[Onto] Fatal Error: ${e.message}`));
    process.exit(1);
});
