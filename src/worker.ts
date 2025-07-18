import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Helper function to get client IP
function getClientIP(request: Request): string {
  const cfConnectingIP = request.headers.get('CF-Connecting-IP');
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  const xRealIP = request.headers.get('X-Real-IP');
  
  return cfConnectingIP || xForwardedFor?.split(',')[0] || xRealIP || '127.0.0.1';
}

// Simple curl detection
function isCurlRequest(userAgent: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return ua.includes('curl') || ua.includes('wget') || ua.includes('httpie');
}

// Main route - handles both curl and browser requests
app.get('/', async (c) => {
  const userAgent = c.req.header('user-agent') || '';
  const clientIP = getClientIP(c.req.raw);
  
  // Return plain IP for curl requests
  if (isCurlRequest(userAgent)) {
    return c.text(clientIP + '\n', 200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
  }
  
  // For browsers, serve a simple HTML page without external assets
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>I KNOW MY IP</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; min-height: 100vh; display: flex; 
            align-items: center; justify-content: center; 
        }
        .container { text-align: center; padding: 2rem; }
        .ip { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
        .info { font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem; }
        .usage { 
            background: rgba(255,255,255,0.1); padding: 1rem; 
            border-radius: 8px; margin-top: 2rem; 
        }
        .usage h3 { margin-bottom: 0.5rem; }
        .code { 
            background: rgba(0,0,0,0.3); padding: 0.5rem; 
            border-radius: 4px; font-family: monospace; 
            margin: 0.5rem 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="ip">${clientIP}</div>
        <div class="info">Your IP Address</div>
        
        <div class="usage">
            <h3>Terminal Usage:</h3>
            <div class="code">curl iknowmyip.com</div>
            <div class="code">wget -qO- iknowmyip.com</div>
        </div>
    </div>
</body>
</html>`);
});

// API endpoints
app.get('/api/ip', async (c) => {
  const clientIP = getClientIP(c.req.raw);
  return c.json({ ip: clientIP, timestamp: new Date().toISOString() });
});

app.get('/txt', async (c) => {
  const clientIP = getClientIP(c.req.raw);
  return c.text(clientIP + '\n', 200, { 'Content-Type': 'text/plain' });
});

app.get('/raw', async (c) => {
  const clientIP = getClientIP(c.req.raw);
  return c.text(clientIP, 200, { 'Content-Type': 'text/plain' });
});

export default app;