import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { promisify } from 'util';
import dns from 'dns';

const resolve4 = promisify(dns.resolve4);

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { domain, dnsServer } = JSON.parse(event.body || '{}');
    
    if (!domain) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Domain is required' }),
      };
    }

    // DNS sunucusunu ayarla (varsayılan Google DNS - 8.8.8.8)
    const dnsResolverServer = dnsServer || '8.8.8.8';
    
    // özel DNS sunucusu kullanarak domain sorgusu yap
    dns.setServers([dnsResolverServer]);
    const ipAddresses = await resolve4(domain);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        domain,
        dnsServer: dnsResolverServer,
        ipAddresses,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('DNS resolve error:', error);
    
    if ((error as NodeJS.ErrnoException).code === 'ENOTFOUND') {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Domain not found'
        }),
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to resolve domain' }),
    };
  }
};