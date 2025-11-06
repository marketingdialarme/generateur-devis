# 🚀 Dialarme Quote Generator v2.0

Modern serverless PDF quote generator for Dialarme - rebuilt with Next.js 14, TypeScript, and modern cloud architecture.

## 📋 Overview

This application completely replaces the previous Google Apps Script-based system with a modern, fully serverless architecture that eliminates slow execution times and improves reliability.

### Key Features

- ✅ **PDF Generation** - Server-side PDF creation with pdf-lib (no client-side generation)
- ✅ **Google Drive Integration** - Direct API integration via service account
- ✅ **Email Delivery** - Professional emails via Resend API
- ✅ **Database Logging** - Supabase for analytics and dashboard
- ✅ **Modern UI** - React, TailwindCSS, Shadcn UI components
- ✅ **Performance** - PDF generation + upload + email in ~3 seconds
- ✅ **Responsive** - Works on desktop, tablet (iPad), and mobile

### Architecture Improvements

| Feature | Old System | New System |
|---------|-----------|------------|
| Backend | Google Apps Script | Next.js API Routes (Serverless) |
| PDF Generation | Client-side (jsPDF) | Server-side (pdf-lib) |
| Execution Time | ~30 seconds | ~3 seconds |
| Drive Access | Apps Script DriveApp | Google Drive REST API |
| Email | Apps Script MailApp | Resend API |
| Logging | Google Sheets | Supabase Database |
| Deployment | Script Editor | Vercel (auto-deploy) |
| Configuration | Hardcoded IDs | Environment variables |

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn UI
- **PDF**: pdf-lib (server-side)
- **Google Drive**: googleapis (REST API)
- **Email**: Resend
- **Database**: Supabase
- **Deployment**: Vercel
- **Validation**: Zod

## 📦 Installation

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn
- Google Cloud Service Account (for Drive API)
- Resend API key (for emails)
- Supabase project (for database)

### Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd dialarm
npm install
```

### Step 2: Set Up Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Drive API**
4. Create a **Service Account**:
   - Navigate to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "dialarme-drive-service")
   - Grant role: "Editor" or specific Drive permissions
5. Create JSON key:
   - Click on the service account
   - Go to "Keys" tab
   - "Add Key" → "Create new key" → JSON
   - Download the JSON file
6. Share your Google Drive folders with the service account email:
   - Open your "Devis" folder in Google Drive
   - Click "Share"
   - Add the service account email (looks like `name@project-id.iam.gserviceaccount.com`)
   - Give "Editor" access

### Step 3: Set Up Resend

1. Go to [Resend](https://resend.com)
2. Sign up and verify your email
3. Add and verify your domain (e.g., `dialarme.fr`)
4. Create an API key
5. Copy the API key for `.env.local`

### Step 4: Set Up Supabase

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to "SQL Editor" and run this SQL:

```sql
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

CREATE INDEX IF NOT EXISTS idx_quotes_commercial ON quotes(commercial);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_type ON quotes(quote_type);
```

4. Copy your project URL and service role key from Settings → API

### Step 5: Configure Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Google Service Account (paste entire JSON as single line)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Google Drive Folder IDs (from URLs)
DRIVE_FOLDER_DEVIS='1BoUAYoJa6uING8-GKZo-ZEPhqql_7SkX'
DRIVE_FOLDER_TECH_SHEETS='1weDBc3uH8FXzrEET1oLrWajFoSstzQTx'
DRIVE_FILE_ALARME_TITANE='12Ntu8bsVpO_CXdAOvL2V_AZcnGo6sA-S'
DRIVE_FILE_ALARME_JABLOTRON='1enFlLv9q681uGBSwdRu43r8Co2nWytFf'
DRIVE_FILE_VIDEO='15daREPnmbS1T76DLUpUxBLWahWIyq_cn'

# Resend API
RESEND_API_KEY='re_xxxxxxxxxxxx'
EMAIL_FROM='devis@dialarme.fr'
EMAIL_DESTINATION='devis.dialarme@gmail.com'

# Supabase
SUPABASE_URL='https://xxxxx.supabase.co'
SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

# App
NEXT_PUBLIC_APP_URL='http://localhost:3000'
```

### Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from `.env.local`

5. Redeploy:
```bash
vercel --prod
```

## 📁 Project Structure

```
dialarm/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── pdf/              # PDF generation
│   │   │   ├── drive-upload/     # Drive upload
│   │   │   ├── email/            # Email sending
│   │   │   ├── log/              # Database logging
│   │   │   ├── dashboard/        # Dashboard data
│   │   │   └── config/           # Configuration
│   │   ├── create-devis/         # Main quote creation page
│   │   ├── dashboard/            # Analytics dashboard
│   │   ├── settings/             # Settings page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   └── ui/                   # Shadcn UI components
│   ├── lib/
│   │   ├── config.ts             # Configuration (converted from config.gs)
│   │   ├── utils.ts              # Utility functions
│   │   ├── products/             # Product catalog
│   │   └── services/             # Core services
│   │       ├── google-drive.service.ts
│   │       ├── pdf.service.ts
│   │       ├── email.service.ts
│   │       └── database.service.ts
├── public/                       # Static assets
├── .env.example                  # Environment template
├── .env.local                    # Your local environment (git-ignored)
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 🔧 Configuration

### Adding Commercials

Edit `src/lib/config.ts`:

```typescript
commercials: {
  'New Commercial': {
    phone: '06 XX XX XX XX',
    email: 'new@dialarme.fr',
    folder: undefined,
  },
  // ... existing commercials
}
```

### Adding Products

Edit `src/lib/products/catalog.ts`:

```typescript
export const CAMERA_PRODUCTS: Product[] = [
  { id: 'new-camera', name: 'New Camera', price: 850, category: 'camera' },
  // ... existing products
];
```

### Modifying Prices

Update prices in `src/lib/products/catalog.ts`:

```typescript
export const SERVICES = {
  alarm: {
    installation: { base: 690, perUnit: 690 },
    // ... other services
  },
};
```

## 🧪 Testing

### Test API Endpoints

```bash
# PDF Generation
curl -X POST http://localhost:3000/api/pdf \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Test","commercial":"Test Commercial","quoteType":"alarme","products":[]}'

# Email Test
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{"toEmail":"your@email.com"}'

# Dashboard Stats
curl http://localhost:3000/api/dashboard?action=stats
```

### Test Complete Flow

1. Open `/create-devis`
2. Fill in client information
3. Select products
4. Generate PDF
5. Check:
   - PDF downloads locally
   - Email received
   - File in Google Drive
   - Entry in Supabase database

## 📊 API Documentation

### POST /api/pdf

Generate PDF with assembly.

**Request:**
```json
{
  "clientName": "Client Name",
  "commercial": "Commercial Name",
  "quoteType": "alarme" | "video",
  "centralType": "titane" | "jablotron",
  "products": ["product1", "product2"],
  "includeAccessories": true,
  "addCommercialOverlay": true
}
```

**Response:**
```json
{
  "success": true,
  "pdfBase64": "JVBERi0x...",
  "fileName": "Devis_Client_2024-11-05.pdf",
  "assemblyInfo": {
    "baseDossier": "ALARME_TITANE",
    "productsFound": 2,
    "totalPages": 15
  },
  "duration": 2.45
}
```

### POST /api/drive-upload

Upload PDF to Google Drive.

**Request:**
```json
{
  "pdfBase64": "JVBERi0x...",
  "fileName": "Devis_Client.pdf",
  "commercial": "Commercial Name"
}
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "1ABC...",
    "name": "Devis_Client.pdf",
    "url": "https://drive.google.com/...",
    "downloadUrl": "https://drive.google.com/..."
  }
}
```

### POST /api/email

Send quote email.

### POST /api/log

Log quote to database.

### GET /api/dashboard?action=stats

Get dashboard statistics.

### GET /api/config

Get public configuration (commercials list, etc.).

## 🐛 Troubleshooting

### "GOOGLE_SERVICE_ACCOUNT_JSON not configured"

Make sure your `.env.local` file has the complete JSON on a single line:
```env
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
```

### "Permission denied" on Google Drive

Ensure you've shared your Drive folders with the service account email address.

### "Invalid API key" for Resend

Verify your domain is verified in Resend dashboard and API key is correct.

### PDF generation timeout

Increase timeout in `next.config.mjs` and `.env.local`:
```env
PDF_TIMEOUT_MS=60000
```

## 📈 Performance

- **Development**: First load ~1-2s, subsequent loads ~200ms
- **Production**: SSR ~500ms, API routes ~200-500ms each
- **PDF Generation**: 1-3s depending on number of products
- **Total workflow**: ~3-5s (vs 30s in old system)

## 🤝 Contributing

This is a proprietary project for Dialarme. For modifications:

1. Update code in `src/`
2. Test locally
3. Update documentation
4. Deploy to staging first
5. Test in production

## 📄 License

Proprietary - Dialarme © 2024

## 👥 Support

For issues or questions:
- Technical: Contact development team
- Business: Contact Dialarme management

---

**Migrated from Google Apps Script to Next.js 14** • **Version 2.0** • **Built with ❤️ for Dialarme**

