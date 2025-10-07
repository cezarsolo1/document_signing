# Zap → Edge Function Migration

This repo recreates your Zap (webhook → loop patients → split documents → loop documents → BoldSign) as an **Edge Function**.

## Contents
- `api/webhook-handler.ts` — Vercel/Next.js edge route handler
- `lib/boldsign.ts` — BoldSign API client
- `workers/webhook-handler.ts` — Cloudflare Workers variant
- `.env.example` — environment variables
- `package.json` — minimal deps
- `wrangler.toml` — Cloudflare Worker config
- `test-payload.json` — sample payload to test

## Workflow parity
1. **Webhook Trigger** → `POST /api/webhook-handler` parses payload.
2. **First Looper (patient)** → loop `signingRequests[]`.
3. **Text Formatter** → split `documents` by comma into array.
4. **Second Looper (document)** → build records per patient × document.
5. **BoldSign** → send template-based signing request for each record.

## Input Payload (example)
```json
{
  "signingRequests": [
    {
      "patient": { "name": "John Doe", "email": "john@example.com" },
      "treatments": "Rhinoplasty",
      "documents": "consent-form,pre-op-instructions,post-op-care",
      "language": "en",
      "deadline": "2025-10-20"
    }
  ]
}
```

## Quickstart (Vercel/Next.js)
1. Copy `api/` and `lib/` into your Next.js project root.
2. Add `BOLDSIGN_API_KEY` to your `.env.local` (see `.env.example`).
3. Run locally and `POST` `test-payload.json` to `http://localhost:3000/api/webhook-handler`.

```bash
curl -X POST http://localhost:3000/api/webhook-handler   -H "Content-Type: application/json"   -d @test-payload.json
```

## Quickstart (Cloudflare Workers)
```bash
npm i -g wrangler
wrangler login
wrangler secret put BOLDSIGN_API_KEY
wrangler deploy
```

---

> **Note:** The code uses `document_type` as the **BoldSign templateId**. Map your document names to template IDs if needed.
