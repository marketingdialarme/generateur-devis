# 🔐 OAuth 2.0 Setup Guide

This guide will help you set up Google OAuth 2.0 authentication for the Dialarme Quote Generator.

## Why OAuth Instead of Service Account?

**Service accounts cannot upload files to personal Gmail Drive accounts.** They can only:
- Upload to Google Workspace **Shared Drives**
- Read files that are explicitly shared with them

Since you're using a personal Gmail account (`devis.dialarme@gmail.com`), you need OAuth 2.0 authentication.

---

## 📋 Prerequisites

- Google Cloud Project (the same one you used for the service account)
- Access to `devis.dialarme@gmail.com` account
- Node.js installed

---

## 🚀 Step-by-Step Setup

### Step 1: Create OAuth Credentials in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Select your project

2. **Enable Google Drive API** (if not already enabled)
   - Go to **"APIs & Services"** → **"Library"**
   - Search for **"Google Drive API"**
   - Click **"Enable"**

3. **Configure OAuth Consent Screen**
   - Go to **"APIs & Services"** → **"OAuth consent screen"**
   - Choose **"External"** (for Gmail accounts)
   - Click **"Create"**
   - Fill in:
     - **App name**: `Dialarme Quote Generator`
     - **User support email**: `devis.dialarme@gmail.com`
     - **Developer contact email**: `devis.dialarme@gmail.com`
   - Click **"Save and Continue"**
   
4. **Add Scopes**
   - Click **"Add or Remove Scopes"**
   - Search and add: `https://www.googleapis.com/auth/drive`
   - Click **"Update"** → **"Save and Continue"**

5. **Add Test Users**
   - Click **"Add Users"**
   - Add: `devis.dialarme@gmail.com`
   - Click **"Save and Continue"** → **"Back to Dashboard"**

6. **Create OAuth Client ID**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click **"+ Create Credentials"** → **"OAuth client ID"**
   - Choose **"Desktop app"**
   - Name it: `Dialarme Desktop Client`
   - Click **"Create"**
   - **IMPORTANT**: Click **"Download JSON"**
   - Save the file as `oauth-credentials.json` in your `generateur-devis` folder

---

### Step 2: Generate Refresh Token

1. **Stop your dev server** (if running)
   ```bash
   # Press Ctrl+C to stop npm run dev
   ```

2. **Run the token generator script**
   ```bash
   cd generateur-devis
   node scripts/generate-oauth-token.js
   ```

3. **Follow the prompts**
   - The script will open your browser
   - Log in with `devis.dialarme@gmail.com`
   - Click **"Allow"** to grant permissions
   - The script will display your credentials

4. **Copy the credentials**
   - The script will output something like:
   ```bash
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
   GOOGLE_REFRESH_TOKEN=1//xxxxx
   ```

---

### Step 3: Update .env.local

1. **Open `.env.local`** in your editor

2. **Remove the service account line** (if present):
   ```bash
   # DELETE THIS LINE:
   GOOGLE_SERVICE_ACCOUNT_JSON=...
   ```

3. **Add the OAuth credentials** (from Step 2):
   ```bash
   # ============================================
   # GOOGLE OAUTH CREDENTIALS
   # ============================================
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REFRESH_TOKEN=your-refresh-token
   ```

4. **Verify your complete `.env.local`** looks like this:
   ```bash
   # ============================================
   # GOOGLE OAUTH CREDENTIALS
   # ============================================
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
   GOOGLE_REFRESH_TOKEN=1//xxxxx

   # ============================================
   # GOOGLE DRIVE CONFIGURATION
   # ============================================
   GOOGLE_DRIVE_FOLDER_DEVIS=1abc...xyz
   GOOGLE_DRIVE_FOLDER_TECH_SHEETS=5mno...lmn

   # Optional: Base PDF file IDs
   GOOGLE_DRIVE_FILE_ALARME_JABLOTRON=1enF...ytFf
   GOOGLE_DRIVE_FILE_ALARME_TITANE=12Nt...6sA-S
   GOOGLE_DRIVE_FILE_VIDEO=15da...Iyq_cn

   # ============================================
   # EMAIL CONFIGURATION (SMTP)
   # ============================================
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=devis.dialarme@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=devis@dialarme.fr
   EMAIL_INTERNAL=devis.dialarme@gmail.com
   ```

---

### Step 4: Validate Configuration

```bash
node scripts/validate-env.js
```

You should see:
```
✅ Found .env.local file

🔐 Authentication Method: OAuth 2.0

📋 Checking Required Variables:

✅ GOOGLE_DRIVE_FOLDER_DEVIS
✅ GOOGLE_DRIVE_FOLDER_TECH_SHEETS
✅ SMTP_HOST
...
```

---

### Step 5: Test the Application

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Open the app**
   - Visit: http://localhost:3000/create-devis

3. **Generate a test quote**
   - Fill in the form
   - Click "Générer et Envoyer"
   - Check:
     - ✅ PDF appears in your Google Drive (in the commercial's folder)
     - ✅ Email is sent

---

## 🔧 Troubleshooting

### Error: "Port 3000 is already in use"
**Solution**: Stop your Next.js dev server before running the token generator:
```bash
# Press Ctrl+C in the terminal running npm run dev
# Then run the token generator
node scripts/generate-oauth-token.js
```

### Error: "Access blocked: This app's request is invalid"
**Solution**: Make sure you added `devis.dialarme@gmail.com` as a test user in Step 1.5

### Error: "The refresh token is invalid"
**Solution**: Re-run the token generator to get a new refresh token:
```bash
node scripts/generate-oauth-token.js
```

### Files still not uploading
**Solution**: 
1. Verify the folder IDs in `.env.local` are correct
2. Make sure you're logged in as `devis.dialarme@gmail.com` when authorizing
3. Check that the folders exist in that account's Drive

---

## 🔒 Security Notes

- **Never commit `.env.local`** to git (it's already in `.gitignore`)
- **Never share your refresh token** - it gives full Drive access
- **Keep `oauth-credentials.json` private** - don't commit it to git
- If credentials are compromised, revoke them in Google Cloud Console

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Reference](https://developers.google.com/drive/api/v3/reference)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes#drive)

---

## ✅ Success Checklist

- [ ] OAuth credentials created in Google Cloud Console
- [ ] `oauth-credentials.json` downloaded
- [ ] Refresh token generated with `generate-oauth-token.js`
- [ ] `.env.local` updated with OAuth credentials
- [ ] Service account line removed from `.env.local`
- [ ] `validate-env.js` passes all checks
- [ ] Test quote successfully uploaded to Drive
- [ ] Email sent successfully

---

**Need help?** Check the terminal logs for detailed error messages.

