# ⚡ Quick Start: OAuth Setup

**Time required**: ~10 minutes

---

## 🎯 What You Need

1. Your Google Cloud project (same one with the service account)
2. Access to `devis.dialarme@gmail.com`
3. The OAuth credentials JSON file from Google Cloud Console

---

## 🚀 3-Step Setup

### Step 1: Get OAuth Credentials (5 min)

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click **"+ Create Credentials"** → **"OAuth client ID"**
5. Choose **"Desktop app"**
6. Click **"Create"** → **"Download JSON"**
7. Save as `oauth-credentials.json` in `generateur-devis` folder

### Step 2: Generate Token (2 min)

```bashcd generateur-devis
cd generateur-devis
node scripts/generate-oauth-token.js
```

- Browser will open
- Log in with `devis.dialarme@gmail.com`
- Click "Allow"
- Copy the credentials shown in terminal

### Step 3: Update .env.local (3 min)

1. Open `.env.local`
2. **Delete** this line:
   ```bash
   GOOGLE_SERVICE_ACCOUNT_JSON=...
   ```
3. **Add** these lines (from Step 2):
   ```bash
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
   GOOGLE_REFRESH_TOKEN=1//xxxxx
   ```
4. **Save** the file

---

## ✅ Verify It Works

```bash
# Validate configuration
node scripts/validate-env.js

# Start dev server
npm run dev

# Open app
# Visit: http://localhost:3000/create-devis

# Generate a test quote
# Check that PDF appears in Drive and email is sent
```

---

## 🆘 Problems?

### "Port 3000 is already in use"
Stop your dev server (Ctrl+C) before running the token generator.

### "Access blocked"
Make sure you configured the OAuth consent screen and added `devis.dialarme@gmail.com` as a test user.

See [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md) for detailed troubleshooting.

---

## 📋 Your .env.local Should Look Like:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REFRESH_TOKEN=1//xxxxx

# Google Drive
GOOGLE_DRIVE_FOLDER_DEVIS=1abc...xyz
GOOGLE_DRIVE_FOLDER_TECH_SHEETS=5mno...lmn

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=devis.dialarme@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=devis@dialarme.fr
EMAIL_INTERNAL=devis.dialarme@gmail.com
```

---

**That's it!** 🎉 Your app can now upload to Google Drive using OAuth.

