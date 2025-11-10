#!/usr/bin/env node

/**
 * ============================================================================
 * OAUTH TOKEN GENERATOR
 * ============================================================================
 * 
 * This script helps you generate a refresh token for Google Drive OAuth 2.0
 * 
 * Prerequisites:
 * 1. You must have created OAuth 2.0 credentials in Google Cloud Console
 * 2. You must have downloaded the credentials JSON file
 * 
 * Usage:
 *   node scripts/generate-oauth-token.js path/to/oauth-credentials.json
 * 
 * The script will:
 * 1. Read your OAuth credentials
 * 2. Generate an authorization URL
 * 3. Open your browser for authorization
 * 4. Exchange the authorization code for a refresh token
 * 5. Display the credentials to add to your .env.local
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { google } = require('googleapis');
const { exec } = require('child_process');

// Configuration
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const PORT = 3000;

/**
 * Main function
 */
async function main() {
  console.log('\n🔐 Google Drive OAuth Token Generator\n');
  console.log('=' .repeat(60) + '\n');

  // Get credentials file path from command line or use default
  const credentialsPath = process.argv[2] || path.join(__dirname, '..', 'oauth-credentials.json');

  // Check if credentials file exists
  if (!fs.existsSync(credentialsPath)) {
    console.error('❌ OAuth credentials file not found!\n');
    console.log('📝 Steps to get OAuth credentials:\n');
    console.log('1. Go to https://console.cloud.google.com');
    console.log('2. Select your project');
    console.log('3. Go to "APIs & Services" → "Credentials"');
    console.log('4. Click "Create Credentials" → "OAuth client ID"');
    console.log('5. Choose "Desktop app" or "Web application"');
    console.log('6. Download the JSON file');
    console.log('7. Save it as "oauth-credentials.json" in the project root\n');
    console.log(`Expected path: ${credentialsPath}\n`);
    process.exit(1);
  }

  // Load credentials
  let credentials;
  try {
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    const credentialsJson = JSON.parse(credentialsContent);
    
    // Handle both web and installed app credential formats
    if (credentialsJson.web) {
      credentials = credentialsJson.web;
    } else if (credentialsJson.installed) {
      credentials = credentialsJson.installed;
    } else {
      credentials = credentialsJson;
    }
  } catch (error) {
    console.error('❌ Failed to parse credentials file:', error.message);
    process.exit(1);
  }

  const { client_id, client_secret } = credentials;

  if (!client_id || !client_secret) {
    console.error('❌ Invalid credentials file format. Missing client_id or client_secret.');
    process.exit(1);
  }

  console.log('✅ OAuth credentials loaded\n');
  console.log(`   Client ID: ${client_id.substring(0, 20)}...`);
  console.log(`   Client Secret: ${client_secret.substring(0, 10)}...\n`);

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    REDIRECT_URI
  );

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent screen to get refresh token
  });

  console.log('🌐 Opening browser for authorization...\n');
  console.log('   If browser doesn\'t open, visit this URL:\n');
  console.log(`   ${authUrl}\n`);

  // Create local server to receive callback
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/oauth2callback')) {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      const code = url.searchParams.get('code');

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>❌ Authorization failed</h1><p>No authorization code received.</p>');
        server.close();
        process.exit(1);
      }

      // Exchange code for tokens
      try {
        const { tokens } = await oauth2Client.getToken(code);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head>
              <title>Authorization Successful</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                h1 { color: #4CAF50; }
                code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
              </style>
            </head>
            <body>
              <h1>✅ Authorization Successful!</h1>
              <p>You can close this window and return to your terminal.</p>
              <p>The refresh token has been generated and displayed in your terminal.</p>
            </body>
          </html>
        `);

        server.close();

        // Display results
        console.log('\n' + '='.repeat(60) + '\n');
        console.log('✅ Authorization successful!\n');
        console.log('📋 Add these to your .env.local file:\n');
        console.log('# ============================================');
        console.log('# GOOGLE OAUTH CREDENTIALS');
        console.log('# ============================================');
        console.log(`GOOGLE_CLIENT_ID=${client_id}`);
        console.log(`GOOGLE_CLIENT_SECRET=${client_secret}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\n' + '='.repeat(60) + '\n');
        console.log('⚠️  IMPORTANT: Keep these credentials secure!\n');
        console.log('📝 Next steps:\n');
        console.log('1. Copy the above lines to your .env.local file');
        console.log('2. Remove GOOGLE_SERVICE_ACCOUNT_JSON from .env.local (if present)');
        console.log('3. Restart your development server: npm run dev');
        console.log('4. Test quote generation\n');

        process.exit(0);
      } catch (error) {
        console.error('\n❌ Failed to exchange authorization code:', error.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>❌ Token exchange failed</h1><p>Check terminal for details.</p>');
        server.close();
        process.exit(1);
      }
    }
  });

  // Start server
  server.listen(PORT, () => {
    console.log(`🚀 Local server started on port ${PORT}\n`);
    console.log('⏳ Waiting for authorization...\n');
    
    // Try to open browser (cross-platform)
    const openCommand = process.platform === 'win32' ? 'start' : 
                       process.platform === 'darwin' ? 'open' : 'xdg-open';
    
    exec(`${openCommand} "${authUrl}"`, (error) => {
      if (error) {
        console.log('⚠️  Could not open browser automatically.');
        console.log('   Please copy and paste the URL above into your browser.\n');
      }
    });
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.`);
      console.log('\n📝 Solutions:');
      console.log('1. Stop your Next.js dev server temporarily');
      console.log('2. Or change the port in this script\n');
      process.exit(1);
    } else {
      console.error('\n❌ Server error:', error.message);
      process.exit(1);
    }
  });
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});

