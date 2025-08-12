import { VercelRequest, VercelResponse } from '@vercel/node';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolve4 = promisify(dns.resolve4);

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
    const domain = req.query.domain as string;
    const recordType = req.query.type as string;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }
    
    if (!recordType || !['A', 'MX', 'NS'].includes(recordType)) {
      return res.status(400).json({ error: 'Valid record type (A, MX, NS) is required' });
    }
    
    let results;
    
    switch (recordType) {
      case 'A':
        results = await resolve4(domain);
        results = results.map(ip => ({ value: ip, ttl: 3600 }));
        break;
      case 'MX':
        results = await resolveMx(domain);
        results = results.map(mx => ({ 
          value: mx.exchange, 
          priority: mx.priority, 
          ttl: 3600 
        }));
        break;
      case 'NS':
        results = await resolveNs(domain);
        results = results.map(ns => ({ value: ns, ttl: 86400 }));
        break;
    }
    
    res.json({
      domain,
      recordType,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('DNS lookup error:', error);
    
    if ((error as NodeJS.ErrnoException).code === 'ENOTFOUND') {
      return res.status(404).json({ 
        error: 'Domain not found or no records of the requested type' 
      });
    }
    
    res.status(500).json({ error: 'Failed to perform DNS lookup' });
  }
}