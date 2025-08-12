import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { promisify } from 'util';
import dns from 'dns';

const resolve4 = promisify(dns.resolve4);
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const domain = event.queryStringParameters?.domain;
    const recordType = event.queryStringParameters?.type;
    
    if (!domain) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Domain is required' }),
      };
    }
    
    if (!recordType || !['A', 'MX', 'NS'].includes(recordType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid record type (A, MX, NS) is required' }),
      };
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        domain,
        recordType,
        results,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('DNS lookup error:', error);
    
    if ((error as NodeJS.ErrnoException).code === 'ENOTFOUND') {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Domain not found or no records of the requested type' 
        }),
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to perform DNS lookup' }),
    };
  }
};