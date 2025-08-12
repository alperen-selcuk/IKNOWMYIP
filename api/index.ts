import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const userAgent = req.headers['user-agent'] || '';
  
  // If the request is from cURL, return IP address
  if (userAgent.toLowerCase().includes('curl')) {
    const ip = getIpAddress(req);
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(ip + '\n');
    return;
  }

  // For browser requests, serve the built React app's index.html
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>I Know My IP</title>
        <script type="module" crossorigin src="/assets/index.js"></script>
        <link rel="stylesheet" crossorigin href="/assets/index.css">
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `);
}

function getIpAddress(req: VercelRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return Array.isArray(forwardedFor) 
      ? forwardedFor[0] 
      : forwardedFor.split(',')[0];
  }
  return req.socket.remoteAddress || '127.0.0.1';
}