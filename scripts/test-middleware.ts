import { ontoMiddleware } from '../packages/next/src/middleware';
import { NextRequest } from 'next/server';

async function runTest() {
    process.env.ONTO_API_KEY = 'onto_live_test_123';
    process.env.ONTO_DASHBOARD_URL = 'http://localhost:3001';

    console.log('\n--- 🧪 Testing Middleware: Tracking & Injection ---');

    // Mock request from ClaudeBot
    const req = new NextRequest('http://localhost:3000/pricing', {
        headers: {
            'user-agent': 'ClaudeBot/3.0',
            'accept': 'text/markdown',
            'host': 'localhost:3000'
        }
    });

    console.log('\n[Test] 1. Dispatching request as ClaudeBot...');
    
    // We need to polyfill/mock the origin to ensure 'url.origin' works in the middleware context
    // In Edge Runtime, url.origin is usually available.
    
    try {
        const response = await ontoMiddleware(req);
        
        console.log(`\n[Test] Response Status: ${response.status}`);
        console.log(`[Test] Content-Type: ${response.headers.get('content-type')}`);
        console.log(`[Test] X-Onto-Injected: ${response.headers.get('x-onto-injected')}`);
        
        const body = await response.text();
        console.log('\n[Test] Body Snippet:');
        console.log(body.substring(0, 300) + '...');
        
        if (response.headers.get('x-onto-injected') === 'true') {
            console.log('\n✅ SUCCESS: Middleware successfully synchronized with Control Plane and injected content!');
        } else {
            console.log('\n❌ FAILURE: Middleware did not perform injection.');
        }

    } catch (err) {
        console.error('\n❌ Error during middleware execution:', err);
    }
}

// Note: To run this, we need to mock 'NextResponse' and 'NextRequest' or run in an environment where they exist.
// Since 'next/server' is hard to run in pure node, I'll rely on the mock server logs 
// and a simplified integration test if this fails.
runTest();
