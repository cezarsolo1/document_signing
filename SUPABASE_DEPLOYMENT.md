# Supabase Edge Function Deployment Guide

## 🚀 Deploy to Supabase Edge Functions

Your webhook handler has been converted to a Supabase Edge Function using Deno runtime.

---

## 📋 Prerequisites

1. **Supabase account**: Sign up at https://supabase.com
2. **Supabase CLI**: Install the CLI tool
3. **BoldSign API key**: Your BoldSign API key

---

## 🛠️ Setup Instructions

### Step 1: Install Supabase CLI

**macOS/Linux**:
```bash
brew install supabase/tap/supabase
```

**Or using npm**:
```bash
npm install -g supabase
```

**Verify installation**:
```bash
supabase --version
```

---

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

---

### Step 3: Link to Your Supabase Project

**Option A: Create a new project**
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details
4. Copy your project reference ID

**Option B: Use existing project**
1. Go to your project dashboard
2. Settings → General → Reference ID

**Link the project**:
```bash
cd /Users/cezar/Downloads/zap-to-edge-markdown-and-code
supabase link --project-ref YOUR_PROJECT_REF
```

---

### Step 4: Set Environment Variables (Secrets)

```bash
supabase secrets set BOLDSIGN_API_KEY=your_boldsign_api_key_here
```

Verify:
```bash
supabase secrets list
```

---

### Step 5: Deploy the Edge Function

```bash
supabase functions deploy webhook-handler
```

You'll see output like:
```
Deploying function webhook-handler...
Function webhook-handler deployed successfully!
Function URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-handler
```

---

## 🧪 Test Your Deployment

### Test with curl:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-handler \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d @test-payload.json
```

**Note**: Get your `ANON_KEY` from:
- Supabase Dashboard → Settings → API → `anon` `public`

### Or without auth (if verify_jwt = false):

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-handler \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

## 🔧 Local Development & Testing

### Start Supabase locally:

```bash
supabase start
```

This starts:
- API: http://localhost:54321
- Studio: http://localhost:54323
- Edge Functions: http://localhost:54321/functions/v1/

### Serve the function locally:

```bash
supabase functions serve webhook-handler --env-file .env.local
```

### Test locally:

```bash
curl -X POST http://localhost:54321/functions/v1/webhook-handler \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

## 📁 Project Structure

```
supabase/
├── config.toml                          # Supabase configuration
└── functions/
    └── webhook-handler/
        └── index.ts                     # Edge function code
```

---

## ⚙️ Configuration Options

### Enable/Disable JWT Verification

Edit `supabase/config.toml`:

```toml
[functions.webhook-handler]
verify_jwt = false  # Set to true to require authentication
```

If `verify_jwt = true`, requests must include:
```
Authorization: Bearer YOUR_ANON_OR_SERVICE_KEY
```

---

## 🔐 Security Best Practices

### 1. Use Service Role Key for Internal Calls
For internal services, use the service role key (more permissions).

### 2. Enable JWT Verification for Public Endpoints
If your webhook is public, consider:
- API key validation
- Rate limiting
- IP whitelisting

### 3. Rotate Secrets Regularly
```bash
supabase secrets set BOLDSIGN_API_KEY=new_key_here
supabase functions deploy webhook-handler
```

---

## 📊 Monitoring & Logs

### View function logs:

```bash
supabase functions logs webhook-handler
```

### Follow logs in real-time:

```bash
supabase functions logs webhook-handler --follow
```

### View in Dashboard:
1. Go to Supabase Dashboard
2. Edge Functions → webhook-handler
3. Click "Logs" tab

---

## 🚀 Production Checklist

Before going live:

- [ ] Set `BOLDSIGN_API_KEY` secret in Supabase
- [ ] Change `isSandbox: true` to `isSandbox: false` in `index.ts`
- [ ] Deploy updated function: `supabase functions deploy webhook-handler`
- [ ] Test with real BoldSign templates
- [ ] Configure JWT verification if needed
- [ ] Set up monitoring/alerts
- [ ] Document your webhook URL

---

## 🔗 Your Webhook URL

After deployment, your webhook URL will be:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/webhook-handler
```

Use this URL in:
- Zapier webhooks
- Make.com (Integromat)
- n8n
- Any webhook service

---

## 🆘 Troubleshooting

### Function fails to deploy
```bash
# Check function syntax
deno check supabase/functions/webhook-handler/index.ts

# View detailed logs
supabase functions deploy webhook-handler --debug
```

### Environment variable not found
```bash
# List all secrets
supabase secrets list

# Set missing secret
supabase secrets set BOLDSIGN_API_KEY=your_key
```

### CORS issues
The function includes CORS headers. If issues persist, check:
- Browser console for specific errors
- Function logs for request details

### Function times out
Supabase Edge Functions have a 150-second timeout. If processing many documents:
- Process in batches
- Use async/parallel processing
- Consider background jobs for large batches

---

## 📝 Update Function

After making changes to `supabase/functions/webhook-handler/index.ts`:

```bash
# Deploy updated function
supabase functions deploy webhook-handler

# Or deploy all functions
supabase functions deploy
```

---

## 🔄 Comparison: Supabase vs Vercel vs Cloudflare

| Feature | Supabase | Vercel | Cloudflare |
|---------|----------|--------|------------|
| Runtime | Deno | Node.js | V8 Isolates |
| Cold Start | ~100ms | ~50ms | ~0ms |
| Free Tier | 500K requests/month | Unlimited | 100K requests/day |
| Timeout | 150s | 10s (hobby) | 10s (free) |
| Database | Built-in Postgres | External | External |
| Auth | Built-in | External | External |

**Supabase Benefits**:
- ✅ Built-in database access
- ✅ Built-in authentication
- ✅ Longer timeout (150s)
- ✅ Deno runtime (modern, secure)
- ✅ Integrated with Supabase ecosystem

---

## 🎯 Quick Commands Reference

```bash
# Login
supabase login

# Link project
supabase link --project-ref YOUR_REF

# Set secrets
supabase secrets set KEY=value

# Deploy function
supabase functions deploy webhook-handler

# View logs
supabase functions logs webhook-handler

# Local development
supabase start
supabase functions serve webhook-handler

# Stop local instance
supabase stop
```

---

## ✨ You're Ready!

Your webhook handler is now configured as a Supabase Edge Function. Just run:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set BOLDSIGN_API_KEY=your_key
supabase functions deploy webhook-handler
```

**Deployment time**: ~1 minute
