# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed (optional, for CLI deployment)
- BoldSign API key

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Push to Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 3: Import to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 4: Add Environment Variables
In the Vercel dashboard, add:
- **Key**: `BOLDSIGN_API_KEY`
- **Value**: Your BoldSign API key
- **Environment**: Production, Preview, Development (select all)

### Step 5: Deploy
Click "Deploy" and wait for the build to complete.

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? `zap-to-edge-function` (or your preferred name)
- In which directory is your code located? `./`

### Step 5: Add Environment Variable
```bash
vercel env add BOLDSIGN_API_KEY
```
Enter your BoldSign API key when prompted.

### Step 6: Deploy to Production
```bash
vercel --prod
```

---

## Post-Deployment

### Test Your Deployment
Once deployed, you'll receive a URL like: `https://your-project.vercel.app`

Test the webhook endpoint:
```bash
curl -X POST https://your-project.vercel.app/api/webhook-handler \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

### Expected Response
```json
{
  "success": true,
  "processed": 5,
  "results": [
    {
      "success": true,
      "record": { ... },
      "requestId": "..."
    }
  ]
}
```

---

## Environment Variables

### Required
- `BOLDSIGN_API_KEY` - Your BoldSign API key

### Optional
- `BOLDSIGN_API_URL` - BoldSign API endpoint (defaults to https://api.boldsign.com/v1/template/send)

---

## Important: Production Settings

Before going live, update these settings in `lib/boldsign.ts`:

```typescript
// Change this from true to false
isSandbox: false,  // ← Change to false for production
```

---

## Monitoring & Logs

### View Logs
1. Go to your project in Vercel dashboard
2. Click on "Deployments"
3. Select a deployment
4. Click "Functions" tab to see edge function logs

### Real-time Logs (CLI)
```bash
vercel logs <deployment-url>
```

---

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure TypeScript files have no errors
- Review build logs in Vercel dashboard

### API Returns 500 Error
- Verify `BOLDSIGN_API_KEY` is set correctly
- Check function logs for detailed error messages
- Ensure BoldSign API is accessible

### Environment Variables Not Working
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- Ensure variables are set for the correct environment

---

## Webhook Integration

Once deployed, use your Vercel URL as the webhook endpoint:

**Webhook URL**: `https://your-project.vercel.app/api/webhook-handler`

Configure this URL in your webhook source (Zapier, Make.com, etc.)

---

## Custom Domain (Optional)

1. Go to project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Use custom domain for webhook: `https://yourdomain.com/api/webhook-handler`

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>
```
