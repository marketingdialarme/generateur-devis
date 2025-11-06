# ⚡ Quick Start Guide - Dialarme Quote Generator

Get up and running in **15 minutes**!

## 🎯 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Google account with access to Drive
- [ ] Email account for Resend (or Gmail)
- [ ] Credit card for Supabase (free tier available)

## 🚀 5-Step Setup

### Step 1: Clone and Install (2 min)

```bash
# Clone the repository
git clone <your-repo-url>
cd dialarm

# Install dependencies
npm install
```

### Step 2: Google Service Account (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project: "Dialarme Quotes"
3. Enable "Google Drive API"
4. Create Service Account:
   - IAM & Admin → Service Accounts → Create
   - Name: `dialarme-drive`
   - Role: Editor
5. Download JSON key
6. Share your Drive folders with service account email

**Example service account email:**
```
dialarme-drive@your-project.iam.gserviceaccount.com
```

### Step 3: Resend Setup (3 min)

1. Go to [Resend.com](https://resend.com/signup)
2. Sign up
3. Add domain and verify DNS records
4. Create API key
5. Copy key (starts with `re_`)

### Step 4: Supabase Setup (3 min)

1. Go to [Supabase.com](https://supabase.com)
2. Create project: "Dialarme"
3. Go to SQL Editor
4. Run this SQL:

```sql
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  commercial TEXT NOT NULL,
  quote_type TEXT NOT NULL,
  central_type TEXT,
  products TEXT[] DEFAULT '{}',
  products_count INTEGER DEFAULT 0,
  file_name TEXT NOT NULL,
  drive_url TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quotes_commercial ON quotes(commercial);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
```

5. Copy URL and service_role key from Settings → API

### Step 5: Configure Environment (2 min)

Create `.env.local`:

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your values:

```env
# Google (paste ENTIRE JSON on one line)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Drive folder IDs (from URLs)
DRIVE_FOLDER_DEVIS='YOUR_FOLDER_ID'
DRIVE_FOLDER_TECH_SHEETS='YOUR_FOLDER_ID'
DRIVE_FILE_ALARME_TITANE='YOUR_FILE_ID'
DRIVE_FILE_ALARME_JABLOTRON='YOUR_FILE_ID'
DRIVE_FILE_VIDEO='YOUR_FILE_ID'

# Resend
RESEND_API_KEY='re_YOUR_KEY'
EMAIL_FROM='devis@dialarme.fr'
EMAIL_DESTINATION='devis.dialarme@gmail.com'

# Supabase
SUPABASE_URL='https://xxx.supabase.co'
SUPABASE_SERVICE_ROLE_KEY='YOUR_SERVICE_KEY'

# App
NEXT_PUBLIC_APP_URL='http://localhost:3000'
```

## ✅ Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Test the Application

1. **Test Configuration**
   ```bash
   curl http://localhost:3000/api/config
   ```
   Should return commercials list

2. **Create a Test Quote**
   - Go to `/create-devis`
   - Fill in client name
   - Select commercial
   - Add products
   - Click "Générer le devis"

3. **Verify Success**
   - ✅ PDF downloads
   - ✅ Email received
   - ✅ File in Google Drive
   - ✅ Entry in Supabase

## 🚀 Deploy to Vercel (5 min)

### Option 1: CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add GOOGLE_SERVICE_ACCOUNT_JSON
# ... (repeat for all variables)

# Deploy to production
vercel --prod
```

### Option 2: GitHub

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import repository
4. Add environment variables
5. Deploy

## 📋 Environment Variables Checklist

Copy these to Vercel:

- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON`
- [ ] `DRIVE_FOLDER_DEVIS`
- [ ] `DRIVE_FOLDER_TECH_SHEETS`
- [ ] `DRIVE_FILE_ALARME_TITANE`
- [ ] `DRIVE_FILE_ALARME_JABLOTRON`
- [ ] `DRIVE_FILE_VIDEO`
- [ ] `RESEND_API_KEY`
- [ ] `EMAIL_FROM`
- [ ] `EMAIL_DESTINATION`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

## 🐛 Common Issues & Fixes

### "Cannot find module '@/lib/config'"

```bash
# Restart dev server
npm run dev
```

### "GOOGLE_SERVICE_ACCOUNT_JSON not configured"

Make sure JSON is on **one line** in `.env.local`:
```env
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
```

### "Permission denied" on Drive

Share your Drive folders with the service account email address.

### "Invalid API key" for Resend

1. Check domain is verified in Resend
2. Verify API key is correct
3. Make sure key has sending permissions

### PDF generation timeout

Increase timeout in `.env.local`:
```env
PDF_TIMEOUT_MS=60000
```

## 📚 Next Steps

Once running:

1. **Customize Configuration**
   - Edit `src/lib/config.ts` to add/update commercials
   - Edit `src/lib/products/catalog.ts` to modify products

2. **Explore Features**
   - Create test quotes
   - View dashboard (when implemented)
   - Test email delivery

3. **Read Full Documentation**
   - [README.md](./README.md) - Complete project overview
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
   - [SUMMARY.md](./SUMMARY.md) - What was built

## 🆘 Need Help?

### Check These First:
1. Console logs in browser (F12)
2. Terminal logs in dev server
3. Vercel function logs (in dashboard)
4. Supabase logs (in dashboard)

### Resources:
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs

## 🎉 Success!

Once you see this, you're ready:

```
✓ Ready in 1.2s
○ Compiling / ...
✓ Compiled in 234ms
```

Visit [http://localhost:3000](http://localhost:3000) and start creating quotes!

---

**Total setup time: ~15 minutes** ⏱️  
**You're now ready to generate quotes!** 🚀

