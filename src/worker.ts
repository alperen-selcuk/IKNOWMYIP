import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: { ASSETS: any } }>();

// Helper function to get client IP
function getClientIP(request: Request): string {
  const cfConnectingIP = request.headers.get('CF-Connecting-IP');
  const cfRealIP = request.headers.get('CF-Real-IP');
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  const xRealIP = request.headers.get('X-Real-IP');
  const remoteAddr = request.headers.get('Remote-Addr');
  
  return cfConnectingIP || cfRealIP || xForwardedFor?.split(',')[0]?.trim() || xRealIP || remoteAddr || '127.0.0.1';
}

// Helper to detect CLI/terminal requests (curl, wget, etc.)
function isCliRequest(headers: Headers): boolean {
  const ua = (headers.get('user-agent') || '').toLowerCase();
  const accept = (headers.get('accept') || '').toLowerCase();
  const secFetchDest = (headers.get('sec-fetch-dest') || '').toLowerCase();
  const secFetchMode = (headers.get('sec-fetch-mode') || '').toLowerCase();

  const uaIsCli = ua.includes('curl') || ua.includes('wget') || ua.includes('httpie') || ua.includes('libcurl') || ua.includes('powershell');
  const acceptPrefersText = (!!accept && (accept === '*/*' || accept.includes('text/plain'))) && !accept.includes('text/html');
  const notABrowserFetch = (!secFetchDest && !secFetchMode) || secFetchDest === 'empty';

  return uaIsCli || (acceptPrefersText && notABrowserFetch);
}

// GLOBAL MIDDLEWARE - Her istekte çalışır
app.use('*', async (c, next) => {
  // CLI tools için herhangi bir path'te IP dön
  if (isCliRequest(c.req.raw.headers)) {
    const clientIP = getClientIP(c.req.raw);
    return new Response(clientIP + '\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Vary': 'Accept, User-Agent',
        'X-Worker-Response': 'true'  // Debug header
      }
    });
  }
  
  return next();
});

// ROOT ROUTE FIRST - before any middleware
app.get('/', async (c) => {
  // Allow explicit plain text via query
  const urlObj = new URL(c.req.url);
  const wantsPlain = urlObj.searchParams.has('plain') || urlObj.searchParams.get('format') === 'txt';
  if (wantsPlain) {
    const clientIP = getClientIP(c.req.raw);
    return new Response(clientIP + '\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Vary': 'Accept, User-Agent',
        'X-Worker-Response': 'true'
      }
    });
  }

  // For browser requests, serve the static index.html
  try {
    const response = await c.env.ASSETS.fetch(new Request('https://assets/index.html'));
    const headers = new Headers(response.headers);
    headers.set('Vary', 'Accept, User-Agent');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('X-Worker-Response', 'true');
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    // Fallback HTML if assets aren't available
    return c.html(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>I KNOW MY IP | IP Information Tool</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <meta name="description" content="View your IP address information instantly. Check DNS records, scan ports, and resolve domains with custom DNS servers." />
    <meta property="og:title" content="I KNOW MY IP | IP Information Tool" />
    <meta property="og:description" content="View your IP address information instantly. Check DNS records, scan ports, and resolve domains with custom DNS servers." />
    <meta property="og:image" content="https://iknowmyip.com/assets/iknowlogo.png" />
    <meta property="og:url" content="https://iknowmyip.com" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#7c3aed" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index-Cw6jctf9.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-cKtbz_UX.css">
  </body>
</html>`, 200, {
      'Vary': 'Accept, User-Agent',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Worker-Response': 'true'
    });
  }
});

// Deterministic plain-text IP endpoint
app.get('/ip', (c) => {
  const clientIP = getClientIP(c.req.raw);
  return new Response(clientIP + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Vary': 'Accept, User-Agent',
      'X-Worker-Response': 'true'
    }
  });
});

// Additional plain IP endpoints that definitely won't be cached
app.get('/plainip', (c) => {
  const clientIP = getClientIP(c.req.raw);
  return new Response(clientIP + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Worker-Response': 'true'
    }
  });
});

app.get('/myip', (c) => {
  const clientIP = getClientIP(c.req.raw);
  return new Response(clientIP + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Worker-Response': 'true'
    }
  });
});

app.get('/getip', (c) => {
  const clientIP = getClientIP(c.req.raw);
  return new Response(clientIP + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Worker-Response': 'true'
    }
  });
});

// CORS middleware
app.use('*', cors({
  origin: ['https://iknowmyip.com', 'https://www.iknowmyip.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// API route for IP information (always JSON)
app.get('/api/ip', async (c) => {
  try {
    const clientIP = getClientIP(c.req.raw);
    const userAgent = c.req.header('user-agent') || '';

    try {
      const ipResponse = await fetch(`https://ipinfo.io/${clientIP}/json`);
      const ipData = await ipResponse.json();
      
      return c.json({
        ip: clientIP,
        info: ipData,
        userAgent,
        datetime: new Date().toISOString()
      });
    } catch (error) {
      return c.json({
        ip: clientIP,
        info: {
          ip: clientIP,
          city: 'Unknown',
          region: 'Unknown',
          country: 'Unknown',
          org: 'Unknown'
        },
        userAgent,
        datetime: new Date().toISOString()
      });
    }
  } catch (error) {
    return c.json({ error: 'Failed to fetch IP information' }, 500);
  }
});

// DNS lookup route
app.get('/api/dns', async (c) => {
  try {
    const domain = c.req.query('domain');
    const recordType = c.req.query('type');
    
    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400);
    }
    
    if (!recordType || !['A', 'MX', 'NS'].includes(recordType)) {
      return c.json({ error: 'Valid record type (A, MX, NS) is required' }, 400);
    }
    
    // Use Cloudflare DNS over HTTPS
    const dnsApiUrl = `https://cloudflare-dns.com/dns-query?name=${domain}&type=${recordType}`;
    
    const response = await fetch(dnsApiUrl, {
      headers: {
        'Accept': 'application/dns-json',
      },
    });
    
    if (!response.ok) {
      return c.json({ error: 'DNS lookup failed' }, 500);
    }
    
    const dnsData = await response.json() as any;
    
    const results = dnsData.Answer?.map((answer: any) => ({
      value: answer.data,
      ttl: answer.TTL,
      type: answer.type
    })) || [];
    
    return c.json({
      domain,
      recordType,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: 'Failed to perform DNS lookup' }, 500);
  }
});

// Port scan route
app.post('/api/port-scan', async (c) => {
  try {
    const { ipAddress, port } = await c.req.json();
    
    if (!ipAddress || !port) {
      return c.json({ error: 'IP address and port are required' }, 400);
    }
    
    // Simple port check using fetch with timeout
    const isOpen = await checkPortOpen(ipAddress, port);
    
    return c.json({
      ipAddress,
      port,
      isOpen,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: 'Failed to scan port' }, 500);
  }
});

// DNS resolve route
app.post('/api/dns-resolve', async (c) => {
  try {
    const { domain, dnsServer } = await c.req.json();
    
    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400);
    }
    
    // Use specified DNS server or default to Cloudflare
    const dnsServerUrl = dnsServer === '8.8.8.8' ? 
      'https://dns.google/dns-query' : 
      'https://cloudflare-dns.com/dns-query';
    
    const response = await fetch(`${dnsServerUrl}?name=${domain}&type=A`, {
      headers: {
        'Accept': 'application/dns-json',
      },
    });
    
    if (!response.ok) {
      return c.json({ error: 'DNS resolution failed' }, 500);
    }
    
    const dnsData = await response.json() as any;
    
    const results = dnsData.Answer?.map((answer: any) => ({
      address: answer.data,
      ttl: answer.TTL
    })) || [];
    
    return c.json({
      domain,
      dnsServer: dnsServer || 'cloudflare',
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ error: 'Failed to resolve domain' }, 500);
  }
});

// Helper function to check if port is open
async function checkPortOpen(ipAddress: string, port: number): Promise<boolean> {
  try {
    // Simple HTTP/HTTPS check for common ports
    const protocol = port === 443 ? 'https' : 'http';
    const url = `${protocol}://${ipAddress}:${port}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // If fetch fails, try a different approach for common ports
    if (port === 80 || port === 443) {
      try {
        const protocol = port === 443 ? 'https' : 'http';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${protocol}://${ipAddress}`, {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return true; // If we get any response, port is open
      } catch {
        return false;
      }
    }
    return false;
  }
}

// Catch-all route for static assets and SPA fallback
app.all('/*', async (c) => {
  try {
    const url = new URL(c.req.url);
    const assetResponse = await c.env.ASSETS.fetch(new Request(`https://assets${url.pathname}`));
    
    if (assetResponse.status === 200) {
      const headers = new Headers(assetResponse.headers);
      headers.set('X-Worker-Response', 'true');
      return new Response(assetResponse.body, { 
        status: assetResponse.status, 
        headers 
      });
    }
  } catch (error) {
    console.log('Asset not found, serving fallback');
  }

  // If asset not found, serve the main app (for SPA routing)
  try {
    const asset = await c.env.ASSETS.fetch(new Request('https://assets/index.html'));
    const headers = new Headers(asset.headers);
    headers.set('Vary', 'Accept, User-Agent');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('X-Worker-Response', 'true');
    return new Response(asset.body, { status: asset.status, headers });
  } catch (error) {
    return new Response('Not Found', { 
      status: 404, 
      headers: { 
        'Vary': 'Accept, User-Agent',
        'X-Worker-Response': 'true'
      } 
    });
  }
});

export default app;