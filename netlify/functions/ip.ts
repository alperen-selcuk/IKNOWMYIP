import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

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
                     context.clientContext?.identity?.ip || 
                     'unknown';

    // Use ipinfo.io to get IP details
    const response = await fetch(`https://ipinfo.io/${ipAddress}/json`);
    const ipInfo = await response.json();

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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch IP information' }),
    };
  }
};