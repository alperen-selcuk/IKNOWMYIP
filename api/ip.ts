import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ipAddress = getIpAddress(req);
    const userAgent = req.headers['user-agent'] || '';
    
    // If the request is from cURL, return only the IP address as plain text
    if (userAgent.toLowerCase().includes('curl')) {
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(ipAddress.replace(/%.*$/, '') + '\n');
      return;
    }
    
    // For browser requests, return detailed info
    const ipResponse = await axios.get(`https://ipinfo.io/${ipAddress}/json`);
    
    res.json({
      ip: ipAddress,
      info: ipResponse.data,
      userAgent,
      datetime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching IP info:', error);
    res.status(500).json({ error: 'Failed to fetch IP information' });
  }
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