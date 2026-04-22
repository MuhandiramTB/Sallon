// Keepalive only for traditional hosts (Render free tier). Skipped on serverless (Vercel).
import https from 'https';
import http from 'http';

const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;

if (!isServerless && RENDER_URL && process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 7 || hour >= 21) return;

    const url = `${RENDER_URL}/api/v1/health`;
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      console.log(`[keepalive] ping status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.log(`[keepalive] ping failed: ${err.message}`);
    });
  }, 10 * 60 * 1000);

  console.log('Keepalive enabled (7 AM - 9 PM)');
}
