import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';
  
  // If the request is from cURL, return IP address
  if (userAgent.toLowerCase().includes('curl')) {
    const ip = getIpAddress(req);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(ip + '\n');
    return;
  }

  // For browser requests, serve static files
  // This should not happen with correct routing, but just in case
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>I KNOW MY IP | IP Information Tool</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <meta name="description" content="View your IP address information instantly. Check DNS records, scan ports, and resolve domains with custom DNS servers." />
    <script type="module" crossorigin src="/assets/index-Cw6jctf9.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-cKtbz_UX.css">
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