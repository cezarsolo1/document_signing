# Quick Start - Deploy to Vercel

## 🚀 Fastest Way to Deploy

### Option 1: One-Click Deploy (Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd /Users/cezar/Downloads/zap-to-edge-markdown-and-code
   vercel
   ```

4. **Add API Key**:
   ```bash
   vercel env add BOLDSIGN_API_KEY production
   ```
   Paste your BoldSign API key when prompted.

5. **Redeploy with environment variable**:
   ```bash
   vercel --prod
   ```

✅ **Done!** Your webhook handler is live at the URL shown.

---

### Option 2: Deploy via GitHub (Recommended for Teams)

1. **Create a GitHub repository** and push this code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Add Environment Variable**:
   - In the import screen, expand "Environment Variables"
   - Add: `BOLDSIGN_API_KEY` = `your_api_key_here`
   - Click "Deploy"

✅ **Done!** Auto-deploys on every git push.

---

## 🧪 Test Locally First

```bash
# Install dependencies (already done)
npm install

# Create .env.local file
echo "BOLDSIGN_API_KEY=your_api_key_here" > .env.local

# Start dev server
npm run dev
```

Visit http://localhost:3000 to see the homepage.

Test the webhook:
```bash
curl -X POST http://localhost:3000/api/webhook-handler \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

## 📝 After Deployment

Your webhook URL will be:
```
https://your-project-name.vercel.app/api/webhook-handler
```

Use this URL in your webhook integrations (Zapier, Make.com, etc.)

---

## ⚙️ Production Checklist

Before going live:
- [ ] Set `BOLDSIGN_API_KEY` environment variable in Vercel
- [ ] Change `isSandbox: true` to `isSandbox: false` in `lib/boldsign.ts`
- [ ] Test with real BoldSign templates
- [ ] Set up monitoring/alerts in Vercel dashboard

---

## 🆘 Need Help?

See `DEPLOYMENT.md` for detailed instructions and troubleshooting.
