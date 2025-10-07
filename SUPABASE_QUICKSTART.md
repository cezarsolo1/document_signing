# 🚀 Supabase Quick Deploy

## Fastest Way to Deploy

### 1. Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

### 2. Login

```bash
supabase login
```

### 3. Create/Link Project

Go to https://app.supabase.com and create a project, then:

```bash
cd /Users/cezar/Downloads/zap-to-edge-markdown-and-code
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Set API Key

```bash
supabase secrets set BOLDSIGN_API_KEY=your_boldsign_api_key_here
```

### 5. Deploy

```bash
supabase functions deploy webhook-handler
```

### 6. Done! 🎉

Your webhook URL:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-handler
```

---

## Test It

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-handler \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

## Before Production

Edit `supabase/functions/webhook-handler/index.ts` line 42:
```typescript
isSandbox: false,  // Change from true to false
```

Then redeploy:
```bash
supabase functions deploy webhook-handler
```

---

## 📖 Full Documentation

See `SUPABASE_DEPLOYMENT.md` for detailed instructions.
