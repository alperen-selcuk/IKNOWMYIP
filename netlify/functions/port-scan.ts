import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { Socket } from 'net';

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
    const { ipAddress, port } = JSON.parse(event.body || '{}');
    
    if (!ipAddress || !port) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'IP address and port are required' }),
      };
    }

    const isOpen = await checkPortOpen(ipAddress, port);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ipAddress,
        port,
        isOpen,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Port scan error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to scan port' }),
    };
  }
};

async function checkPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();
    let isOpen = false;
    
    socket.setTimeout(1500);
    
    socket.on('connect', () => {
      isOpen = true;
      socket.destroy();
    });
    
    socket.on('error', () => {
      socket.destroy();
    });
    
    socket.on('timeout', () => {
      socket.destroy();
    });
    
    socket.on('close', () => {
      resolve(isOpen);
    });
    
    socket.connect(port, host);
  });
}