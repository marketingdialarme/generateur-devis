/**
 * One-shot Google OAuth refresh-token generator for Dialarme.
 *
 * Prereqs:
 *   - Stop the dev server first (this uses port 3000, the registered redirect URI).
 *   - Have your OAuth client id + secret (Google Cloud Console > APIs & Services
 *     > Credentials, or copy from Vercel env GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).
 *
 * Run (PowerShell):
 *   $env:GOOGLE_CLIENT_ID="..."; $env:GOOGLE_CLIENT_SECRET="..."; node scripts/get-refresh-token.mjs
 *
 * Then: open the printed URL, log in with the Dialarme Google account, click Allow.
 * The script prints GOOGLE_REFRESH_TOKEN. Paste it into .env.local AND Vercel env.
 */
import http from 'node:http';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT = 'http://localhost:3000'; // must match the app + the OAuth client's authorized redirect URI

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars first.');
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT);
const authUrl = oauth2.generateAuthUrl({
  access_type: 'offline',          // required to receive a refresh_token
  prompt: 'consent',               // force a fresh refresh_token even if previously granted
  scope: ['https://www.googleapis.com/auth/drive'],
});

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, REDIRECT).searchParams.get('code');
  if (!code) { res.statusCode = 400; res.end('No ?code in callback.'); return; }
  try {
    const { tokens } = await oauth2.getToken(code);
    res.end('Done. Return to the terminal — your refresh token is printed there.');
    if (tokens.refresh_token) {
      console.log('\n================ GOOGLE_REFRESH_TOKEN ================\n');
      console.log(tokens.refresh_token);
      console.log('\n======================================================\n');
    } else {
      console.error('No refresh_token returned. Revoke prior access at https://myaccount.google.com/permissions then retry.');
    }
  } catch (e) {
    res.statusCode = 500; res.end('Token exchange failed: ' + e.message);
    console.error('Token exchange failed:', e.message);
  } finally {
    server.close();
    setTimeout(() => process.exit(0), 200);
  }
});

server.listen(3000, () => {
  console.log('\n1) Open this URL in a browser, log in, click Allow:\n');
  console.log('   ' + authUrl + '\n');
  console.log('2) Waiting for the redirect on http://localhost:3000 ...\n');
});
