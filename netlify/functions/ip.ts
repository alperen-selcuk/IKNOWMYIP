import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import https from 'https';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Get IP address from Netlify context
    const ipAddress = event.headers['x-forwarded-for']?.split(',')[0] || 
                     event.headers['x-real-ip'] || 
                     event.headers['client-ip'] ||
                     'unknown';

    // Use Node.js https module instead of fetch
    const ipInfo = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'ipinfo.io',
        path: `/${ipAddress}/json`,
        method: 'GET',
        headers: {
          'User-Agent': 'iknowmyip/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ip: ipAddress,
        info: ipInfo,
        userAgent: event.headers['user-agent'] || '',
        datetime: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    
    // Fallback: en azından IP adresini döndür
    const ipAddress = event.headers['x-forwarded-for']?.split(',')[0] || 
                     event.headers['x-real-ip'] || 
                     event.headers['client-ip'] ||
                     'unknown';
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ip: ipAddress,
        info: { ip: ipAddress },
        userAgent: event.headers['user-agent'] || '',
        datetime: new Date().toISOString(),
        error: 'Could not fetch detailed IP info'
      }),
    };
  }
};