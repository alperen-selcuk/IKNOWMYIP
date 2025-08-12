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

  // Handle root path - return IP for curl, redirect to static site for browsers
  if (req.url === '/') {
    const userAgent = req.headers['user-agent'] || '';
    
    // If the request is from cURL, return IP address
    if (userAgent.toLowerCase().includes('curl')) {
      const ip = getIpAddress(req);
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(ip + '\n');
      return;
    }
    
    // For browsers, serve the static site
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>I Know My IP</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/static/index.js"></script>
        </body>
      </html>
    `);
    return;
  }

  res.status(404).json({ error: 'Not Found' });
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