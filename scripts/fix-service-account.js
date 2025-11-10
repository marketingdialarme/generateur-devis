#!/usr/bin/env node

/**
 * Fix Service Account JSON
 * 
 * This script helps fix the GOOGLE_SERVICE_ACCOUNT_JSON in .env.local
 * by ensuring the private key has proper \n escape sequences
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Service Account JSON Fixer\n');
console.log('This will help you fix the GOOGLE_SERVICE_ACCOUNT_JSON in your .env.local file.\n');

rl.question('Enter the path to your service account JSON file (e.g., service-account-key.json): ', (jsonFilePath) => {
  
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ File not found: ${jsonFilePath}`);
    rl.close();
    process.exit(1);
  }

  try {
    // Read and parse the JSON file
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const serviceAccount = JSON.parse(jsonContent);

    // Validate it's a service account
    if (serviceAccount.type !== 'service_account') {
      console.error('❌ This doesn not appear to be a service account JSON file');
      rl.close();
      process.exit(1);
    }

    console.log('\n✅ Service account JSON loaded successfully');
    console.log(`📧 Service account email: ${serviceAccount.client_email}`);
    console.log(`🆔 Project ID: ${serviceAccount.project_id}\n`);

    // Convert to single-line JSON (minified)
    const minified = JSON.stringify(serviceAccount);

    console.log('📋 Copy this value and paste it in your .env.local file:\n');
    console.log('GOOGLE_SERVICE_ACCOUNT_JSON=' + minified);
    console.log('\n✅ Make sure to paste it as ONE line in .env.local\n');

    // Optionally write to a file
    rl.question('Do you want to save this to a file? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        const outputPath = path.join(__dirname, '..', 'service-account-minified.txt');
        fs.writeFileSync(outputPath, 'GOOGLE_SERVICE_ACCOUNT_JSON=' + minified);
        console.log(`\n✅ Saved to: ${outputPath}`);
        console.log('You can copy from this file and paste into .env.local\n');
      }
      
      rl.close();
    });

  } catch (error) {
    console.error('❌ Error processing file:', error.message);
    rl.close();
    process.exit(1);
  }
});

