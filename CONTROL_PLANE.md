# SDK Integration Guide: Onto Control Plane Compatibility

This guide outlines the changes required to the `onto-sdk` to make it fully compatible with the new Control Plane dashboard APIs.

## 1. Environment Configuration
The SDK requires the `ONTO_API_KEY` to authenticate with the dashboard.
- **Variable**: `ONTO_API_KEY` (e.g., `onto_live_...`)
- **Dashboard URL**: `http://localhost:3000` (or your production URL)

---

## 2. API: Build-time Manifest Push (`/api/files`)
Currently, the CLI saves `.md` files to `public/.onto`. To sync these with the dashboard, the CLI should push them to the Control Plane.

**Target File**: `onto-sdk/packages/next/src/cli.ts`

**Proposed Logic**:
```typescript
// After generating all files
const manifest = files.map(file => ({
  route: `/${file.replace(/\.html$/, '')}`,
  filename: `${file.replace(/\.html$/, '.md')}`,
  content: fs.readFileSync(path.join(ontoPublicDir, file.replace(/\.html$/, '.md')), 'utf8')
}));

await fetch(`${DASHBOARD_URL}/api/files`, {
  method: 'POST',
  headers: {
    'x-onto-key': process.env.ONTO_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ files: manifest })
});
```

---

## 3. API: Runtime Traffic Tracking (`/api/track`)
The middleware should report AI agent requests to the dashboard for analytics.

**Target File**: `onto-sdk/packages/next/src/middleware.ts`

**Proposed Logic**:
```typescript
if (isAiBot || isMarkdownRequested) {
    // Fire-and-forget tracking call
    fetch(`${DASHBOARD_URL}/api/track`, {
        method: 'POST',
        headers: {
            'x-onto-key': process.env.ONTO_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            route: url.pathname,
            userAgent: userAgent,
            // Calculate these if possible, or send rough estimates
            payloadBytes: markdownSize, 
            htmlBytes: originalHtmlSize 
        })
    }).catch(err => console.error('[Onto] Tracking failed', err));
    
    // ... rest of the middleware logic
}
```

---

## 4. API: Dynamic Context Injection (`/api/sdk/inject`)
To support the "Context Injection" feature, the SDK should fetch and append custom context for the current route.

**Target File**: `onto-sdk/packages/next/src/middleware.ts`

**Proposed Logic**:
```typescript
// Inside the bot identification block
const injectRes = await fetch(`${DASHBOARD_URL}/api/sdk/inject?route=${url.pathname}`, {
    headers: { 'x-onto-key': process.env.ONTO_API_KEY }
});
const { injection } = await injectRes.json();

if (injection) {
    // Append injection to the markdown response
    // Note: Since middleware uses rewrite, you might need a custom route handler 
    // in the app to combine the static file and the injection.
}
```

---

## 5. Graceful Degradation (Non-Premium Users)
The Control Plane is a premium feature. The SDK must work perfectly for users without an `ONTO_API_KEY`. 

**Requirement**: All Control Plane interactions must be wrapped in a check for the API key. If the key is missing, the SDK should fail silently and continue serving local `.md` files as usual.

**Implementation Pattern**:
```typescript
const ONTO_API_KEY = process.env.ONTO_API_KEY;

if (!ONTO_API_KEY) {
  // Option A: Log a subtle info message once (optional)
  // Option B: Silently skip tracking/injection/manifest sync
  return; 
}

// Proceed with Control Plane logic...
```

---

## Summary of URL Endpoints
| Feature | Method | Endpoint |
| :--- | :--- | :--- |
| **Track Traffic** | `POST` | `/api/track` |
| **Sync Manifest** | `POST` | `/api/files` |
| **Fetch Context** | `GET` | `/api/sdk/inject?route=...` |

> [!TIP]
> Use the `x-onto-key` header for all requests. The Control Plane validates this key and ensures the site is **verified** before accepting data or serving context.
