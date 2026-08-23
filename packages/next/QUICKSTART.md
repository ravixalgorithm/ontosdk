# Quick Start: Dynamic llms.txt

Get AI discovery working in 60 seconds.

## Step 1: Initialize

Run the following command in your project root to generate your configuration and middleware:

```bash
npx onto-next init
```

This will create `onto.config.ts` and `middleware.ts` for you.

## Step 2: Configure Build

Update your `package.json` to process your pages after building:

```json
{
  "scripts": {
    "build": "next build && onto-next"
  }
}
```

## Step 3: Test

Start your dev server and visit:

```
http://localhost:3000/llms.txt
```

You should see your dynamically generated llms.txt content!

## Step 3: Deploy

Deploy normally—the middleware automatically serves llms.txt to AI agents.

## What Happens

1. **AI bot requests `/llms.txt`**
2. **Middleware detects the request**
3. **Loads your `onto.config.ts`**
4. **Generates llms.txt dynamically**
5. **Returns with proper headers**

No static files needed—it just works! ✨

## Example Output

```markdown
# My Site

> Brief description for AI agents

## Key Routes

- [/](https://example.com/): Homepage
- [/docs](https://example.com/docs): Documentation
```

## Next Steps

- [Full Configuration Guide](./LLMS_TXT_GUIDE.md)
- [Example Config](./onto.config.example.ts)
- [API Reference](./README.md)

---

Need help? Check the [docs](https://buildonto.dev/docs) or [open an issue](https://github.com/anthropics/onto-sdk/issues).
