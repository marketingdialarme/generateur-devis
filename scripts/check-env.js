#!/usr/bin/env node

/**
 * Environment Configuration Checker
 * Validates all Google Drive IDs in .env.local
 */

const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

console.log('🔍 Checking Environment Configuration\n');

const requiredVars = {
  'GOOGLE_DRIVE_FOLDER_DEVIS': 'Parent folder for commercial subfolders',
  'GOOGLE_DRIVE_FOLDER_TECH_SHEETS': 'Fiches techniques folder',
  'GOOGLE_DRIVE_FOLDER_TITANE': 'Titane quotes folder',
  'GOOGLE_DRIVE_FOLDER_JABLOTRON': 'Jablotron quotes folder',
  'GOOGLE_DRIVE_FOLDER_VIDEO': 'Video quotes folder',
  'GOOGLE_DRIVE_FILE_ALARME_TITANE': 'Titane base PDF file',
  'GOOGLE_DRIVE_FILE_ALARME_JABLOTRON': 'Jablotron base PDF file',
  'GOOGLE_DRIVE_FILE_VIDEO': 'Video base PDF file',
};

let hasErrors = false;

for (const [key, description] of Object.entries(requiredVars)) {
  const value = process.env[key];
  
  if (!value || value.trim() === '' || value === '.') {
    console.log(`❌ ${key}`);
    console.log(`   ${description}`);
    console.log(`   Value: "${value}" (INVALID - empty or just a dot)\n`);
    hasErrors = true;
  } else if (value.length < 10) {
    console.log(`⚠️  ${key}`);
    console.log(`   ${description}`);
    console.log(`   Value: "${value}" (Suspicious - too short)\n`);
    hasErrors = true;
  } else {
    console.log(`✅ ${key}`);
    console.log(`   ${description}`);
    console.log(`   Value: ${value}\n`);
  }
}

if (hasErrors) {
  console.log('\n❌ Configuration has errors! Please fix your .env.local file.\n');
  process.exit(1);
} else {
  console.log('\n✅ All Google Drive IDs look valid!\n');
  process.exit(0);
}

