# 🚀 Deployment Guide - Dialarme Quote Generator

## Quick Deployment Checklist

- [ ] Google Cloud Service Account created
- [ ] Drive folders shared with service account
- [ ] Resend account set up and domain verified
- [ ] Supabase project created with tables
- [ ] Environment variables configured
- [ ] Application tested locally
- [ ] Deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Production tested

## Detailed Deployment Steps

### 1. Google Cloud Setup (15 minutes)

#### Create Service Account

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create or Select Project**
   - Click on project dropdown (top bar)
   - Click "New Project"
   - Name: "Dialarme Quote Generator"
   - Click "Create"

3. **Enable Google Drive API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. **Create Service Account**
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `dialarme-drive-service`
   - Description: "Service account for Dialarme quote generator Drive access"
   - Click "Create and Continue"
   - Grant role: "Editor"
   - Click "Continue" → "Done"

5. **Create JSON Key**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON"
   - Click "Create"
   - JSON file will download automatically
   - **Keep this file secure!**

6. **Get Service Account Email**
   - Copy the email (format: `name@project-id.iam.gserviceaccount.com`)
   - You'll need this to share Drive folders

#### Share Drive Folders

1. **Share Main "Devis" Folder**
   - Open Google Drive
   - Navigate to your "Devis" folder
   - Right-click → "Share"
   - Paste service account email
   - Set permission to "Editor"
   - Uncheck "Notify people"
   - Click "Share"

2. **Share "Fiches techniques" Folder**
   - Repeat the same process for your technical sheets folder

3. **Get Folder and File IDs**
   - Open each folder/file in Drive
   - Copy the ID from the URL:
     ```
     https://drive.google.com/drive/folders/[THIS_IS_THE_ID]
     ```
   - Save these IDs for environment variables

### 2. Resend Setup (5 minutes)

1. **Sign Up**
   ```
   https://resend.com/signup
   ```

2. **Verify Email**
   - Check your inbox and verify

3. **Add Domain**
   - Go to "Domains"
   - Click "Add Domain"
   - Enter your domain (e.g., `dialarme.fr`)
   - Follow DNS verification steps:
     - Add TXT record to your DNS
     - Add CNAME records for DKIM
     - Wait for verification (usually < 5 minutes)

4. **Create API Key**
   - Go to "API Keys"
   - Click "Create API Key"
   - Name: "Dialarme Production"
   - Permission: "Sending access"
   - Copy the key (starts with `re_`)
   - **Save it securely - it's shown only once!**

### 3. Supabase Setup (5 minutes)

1. **Create Project**
   ```
   https://supabase.com/dashboard
   ```
   - Click "New Project"
   - Name: "Dialarme Quotes"
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for provisioning

2. **Create Database Table**
   - Go to "SQL Editor"
   - Click "New Query"
   - Paste this SQL:

```sql
-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_commercial ON quotes(commercial);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_type ON quotes(quote_type);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role access
CREATE POLICY "Service role can do everything"
  ON quotes
  FOR ALL
  USING (auth.role() = 'service_role');
```

   - Click "Run" (or press F5)
   - Verify success message

3. **Get API Credentials**
   - Go to "Settings" → "API"
   - Copy:
     - **Project URL** (e.g., `https://abc123.supabase.co`)
     - **anon public** key (for client-side access)
     - **service_role** key (for server-side access)
   - **Keep service_role key secret!**

### 4. Local Environment Setup

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd dialarm
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure `.env.local`**

   Open `.env.local` and fill in values:

```env
# ============================================================================
# GOOGLE SERVICE ACCOUNT
# ============================================================================
# Open the JSON file you downloaded, copy ENTIRE content as single line
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project-123456","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n","client_email":"dialarme-drive-service@your-project-123456.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}'

# ============================================================================
# GOOGLE DRIVE FOLDER IDS
# ============================================================================
DRIVE_FOLDER_DEVIS='your-devis-folder-id'
DRIVE_FOLDER_TECH_SHEETS='your-tech-sheets-folder-id'
DRIVE_FILE_ALARME_TITANE='your-titane-template-file-id'
DRIVE_FILE_ALARME_JABLOTRON='your-jablotron-template-file-id'
DRIVE_FILE_VIDEO='your-video-template-file-id'

# ============================================================================
# RESEND API
# ============================================================================
RESEND_API_KEY='re_your_resend_api_key'
EMAIL_FROM='devis@dialarme.fr'
EMAIL_DESTINATION='devis.dialarme@gmail.com'

# ============================================================================
# SUPABASE
# ============================================================================
SUPABASE_URL='https://your-project.supabase.co'
SUPABASE_ANON_KEY='your-anon-key'
SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'

# ============================================================================
# APPLICATION
# ============================================================================
NEXT_PUBLIC_APP_URL='http://localhost:3000'
NODE_ENV='development'
PDF_TIMEOUT_MS=30000
MAX_UPLOAD_SIZE=52428800
```

5. **Test Locally**
   ```bash
   npm run dev
   ```
   - Open http://localhost:3000
   - Test quote creation
   - Verify PDF generation, email, and Drive upload

### 5. Deploy to Vercel (10 minutes)

#### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```
   - Follow prompts to authenticate

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow prompts:
     - Link to existing project? No
     - Project name: `dialarm-quote-generator`
     - Directory: `./` (default)
   - Wait for deployment

4. **Set Environment Variables**
   ```bash
   # Set each variable individually
   vercel env add GOOGLE_SERVICE_ACCOUNT_JSON
   # Paste the value when prompted
   # Choose: Production, Preview, Development

   vercel env add DRIVE_FOLDER_DEVIS
   # ... repeat for all variables
   ```

   Or use Vercel dashboard (easier):
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to "Settings" → "Environment Variables"
   - Add all variables from `.env.local`
   - Make sure to select "Production" and "Preview"

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Option B: GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Configure**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all from `.env.local`
   - Click "Deploy"

### 6. Post-Deployment Verification

1. **Test Production URL**
   - Open your Vercel URL (e.g., `https://dialarm-quote-generator.vercel.app`)
   - Navigate to `/create-devis`
   - Create a test quote

2. **Verify Functionality**
   - [ ] PDF generates successfully
   - [ ] Email is sent
   - [ ] File appears in Google Drive
   - [ ] Entry in Supabase database
   - [ ] Dashboard shows stats

3. **Test API Endpoints**
   ```bash
   curl https://your-app.vercel.app/api/config
   curl https://your-app.vercel.app/api/dashboard?action=stats
   ```

### 7. Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to project "Settings" → "Domains"
   - Click "Add"
   - Enter your domain (e.g., `quotes.dialarme.fr`)
   - Click "Add"

2. **Configure DNS**
   - Add CNAME record:
     ```
     quotes.dialarme.fr → cname.vercel-dns.com
     ```
   - Wait for propagation (5-10 minutes)

3. **Update Environment**
   ```bash
   vercel env add NEXT_PUBLIC_APP_URL
   # Value: https://quotes.dialarme.fr
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

## Monitoring and Maintenance

### Vercel Dashboard

Monitor your application at:
```
https://vercel.com/dashboard
```

- **Deployments**: View deployment history
- **Analytics**: See page views and performance
- **Logs**: Debug issues in real-time

### Supabase Dashboard

Monitor database at:
```
https://supabase.com/dashboard
```

- **Table Editor**: View quotes data
- **Logs**: See database queries
- **API**: Monitor API usage

### Regular Maintenance

1. **Weekly**
   - Check dashboard for anomalies
   - Review error logs

2. **Monthly**
   - Update dependencies: `npm update`
   - Review Supabase storage usage
   - Check Google Drive quota

3. **Quarterly**
   - Audit service accounts and API keys
   - Review and optimize database indexes
   - Update documentation

## Rollback Procedure

If something goes wrong:

1. **In Vercel Dashboard**
   - Go to "Deployments"
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Or via CLI**
   ```bash
   vercel rollback
   ```

## Troubleshooting

### Deployment Fails

Check build logs in Vercel dashboard:
- Common issues: missing environment variables, TypeScript errors
- Fix and redeploy

### API Errors in Production

1. Check Vercel Function logs
2. Verify environment variables are set correctly
3. Test API endpoints individually

### Database Connection Issues

1. Verify Supabase project is active
2. Check service role key is correct
3. Ensure table exists (run SQL again if needed)

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Google Cloud Support**: https://cloud.google.com/support
- **Resend Support**: https://resend.com/support

---

**Deployment completed!** 🎉

Your application is now live and ready to generate quotes.

