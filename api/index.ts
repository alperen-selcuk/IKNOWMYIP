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

  // For browser requests, redirect to static index.html
  res.writeHead(302, {
    Location: '/index.html'
  });
  res.end();
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