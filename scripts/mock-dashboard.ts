import http from 'http';

const PORT = 3001;

const server = http.createServer((req, res) => {
    console.log(`[Mock Dashboard] ${req.method} ${req.url}`);
    
    let body = '';
    req.on('data', chunk => body += chunk);
    
    req.on('end', () => {
        if (body) {
            try {
                const data = JSON.parse(body);
                console.log('[Mock Dashboard] Body received:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
            } catch {
                console.log('[Mock Dashboard] Body (raw):', body.substring(0, 500));
            }
        }

        // Auth check
        const apiKey = req.headers['x-onto-key'];
        if (!apiKey) {
            console.log('[Mock Dashboard] ❌ Missing API Key');
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing API Key' }));
            return;
        }

        // Endpoint routing
        if (req.url?.startsWith('/api/files')) {
            console.log('[Mock Dashboard] ✅ Manifest Sync Received');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        } 
        else if (req.url?.startsWith('/api/track')) {
            console.log('[Mock Dashboard] ✅ Tracking Event Received');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        } 
        else if (req.url?.startsWith('/api/sdk/inject')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const route = url.searchParams.get('route');
            console.log(`[Mock Dashboard] ✅ Injection Request for ${route}`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                injection: `## 💡 AI Context (Injected)\nThis content was dynamically injected from the Onto Control Plane for route: **${route}**.\n- Priority: High\n- Source: Dashboard` 
            }));
        } 
        else {
            res.writeHead(404);
            res.end();
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Mock Dashboard running at http://localhost:${PORT}`);
    console.log(`--- Ready to test Onto SDK Integration ---\n`);
});
