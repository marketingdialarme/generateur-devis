#!/usr/bin/env node

/**
 * Environment Validation Script
 * Checks that all required environment variables are configured
 * Run: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Environment Configuration...\n');

// Load .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ Found .env.local file\n');
} else {
  console.log('⚠️  No .env.local file found. Checking process.env...\n');
}

// Check authentication method
const hasOAuth = process.env.GOOGLE_CLIENT_ID && 
                 process.env.GOOGLE_CLIENT_SECRET && 
                 process.env.GOOGLE_REFRESH_TOKEN;
const hasServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!hasOAuth && !hasServiceAccount) {
  console.log('❌ No Google authentication configured!\n');
  console.log('You must configure either:\n');
  console.log('  Option 1 (OAuth - for personal Gmail):');
  console.log('    - GOOGLE_CLIENT_ID');
  console.log('    - GOOGLE_CLIENT_SECRET');
  console.log('    - GOOGLE_REFRESH_TOKEN');
  console.log('\n  Option 2 (Service Account - for Workspace Shared Drives):');
  console.log('    - GOOGLE_SERVICE_ACCOUNT_JSON\n');
  console.log('Run: node scripts/generate-oauth-token.js\n');
  process.exit(1);
}

console.log(`🔐 Authentication Method: ${hasOAuth ? 'OAuth 2.0' : 'Service Account'}\n`);

// Required environment variables
const required = {
  'GOOGLE_DRIVE_FOLDER_DEVIS': {
    description: 'Parent Drive folder ID for all quotes',
    validator: (val) => val && val.length > 10
  },
  'GOOGLE_DRIVE_FOLDER_TECH_SHEETS': {
    description: 'Drive folder ID for technical sheets',
    validator: (val) => val && val.length > 10
  },
  'SMTP_HOST': {
    description: 'SMTP server host (e.g., smtp.gmail.com)',
    validator: (val) => val && val.length > 3
  },
  'SMTP_PORT': {
    description: 'SMTP server port (e.g., 587)',
    validator: (val) => val && !isNaN(parseInt(val))
  },
  'SMTP_USER': {
    description: 'SMTP username/email',
    validator: (val) => val && val.includes('@')
  },
  'SMTP_PASSWORD': {
    description: 'SMTP password (App Password for Gmail)',
    validator: (val) => val && val.length > 5
  },
  'EMAIL_FROM': {
    description: 'From email address',
    validator: (val) => val && val.includes('@')
  },
  'EMAIL_INTERNAL': {
    description: 'Internal email for notifications',
    validator: (val) => val && val.includes('@')
  }
};

let allValid = true;
let warnings = [];

console.log('📋 Checking Required Variables:\n');

for (const [key, config] of Object.entries(required)) {
  const value = process.env[key];
  const exists = !!value;
  const valid = exists && config.validator(value);
  
  if (valid) {
    console.log(`✅ ${key}`);
    console.log(`   ${config.description}`);
  } else if (exists) {
    console.log(`⚠️  ${key} - INVALID FORMAT`);
    console.log(`   ${config.description}`);
    console.log(`   Value exists but failed validation`);
    allValid = false;
  } else {
    console.log(`❌ ${key} - MISSING`);
    console.log(`   ${config.description}`);
    allValid = false;
  }
  console.log('');
}

// Optional variables
const optional = {
  'GOOGLE_DRIVE_FILE_ALARME_JABLOTRON': 'Jablotron base PDF file ID',
  'GOOGLE_DRIVE_FILE_ALARME_TITANE': 'Titane base PDF file ID',
  'GOOGLE_DRIVE_FILE_VIDEO': 'Video base PDF file ID',
  'GOOGLE_DRIVE_FOLDER_PRODUCT_SHEETS': 'Product sheets folder ID',
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL (optional for logging)',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anon key (optional for logging)'
};

console.log('📋 Checking Optional Variables:\n');

for (const [key, description] of Object.entries(optional)) {
  const exists = !!process.env[key];
  if (exists) {
    console.log(`✅ ${key}`);
    console.log(`   ${description}`);
  } else {
    console.log(`⚪ ${key} - Not set (optional)`);
    console.log(`   ${description}`);
    warnings.push(`Consider setting ${key} for full functionality`);
  }
  console.log('');
}

// Summary
console.log('\n' + '='.repeat(60) + '\n');

if (allValid) {
  console.log('✅ All required environment variables are configured!\n');
  console.log('📝 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Open: http://localhost:3000/create-devis');
  console.log('   3. Test quote generation');
  console.log('   4. Verify Drive upload and email delivery\n');
  
  if (warnings.length > 0) {
    console.log('⚠️  Optional recommendations:');
    warnings.forEach(w => console.log(`   - ${w}`));
    console.log('');
  }
  
  process.exit(0);
} else {
  console.log('❌ Environment configuration incomplete!\n');
  console.log('📝 Required actions:');
  console.log('   1. Create .env.local file in project root');
  console.log('   2. Add missing/invalid environment variables');
  console.log('   3. Re-run: node scripts/validate-env.js');
  console.log('   4. See END_TO_END_TEST_REPORT.md for setup guide\n');
  
  console.log('💡 Example .env.local format (OAuth):');
  console.log(`
# Google OAuth (for personal Gmail)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REFRESH_TOKEN=1//xxxxx

# Google Drive folders
GOOGLE_DRIVE_FOLDER_DEVIS=1abc...xyz
GOOGLE_DRIVE_FOLDER_TECH_SHEETS=5mno...lmn

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=devis.dialarme@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=devis@dialarme.fr
EMAIL_INTERNAL=devis.dialarme@gmail.com
  `);
  
  process.exit(1);
}

