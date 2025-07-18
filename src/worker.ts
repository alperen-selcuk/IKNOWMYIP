import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: ['https://iknowmyip.com', 'https://www.iknowmyip.com'],
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

// Helper function to detect cURL requests - more precise detection
function isCurlRequest(userAgent: string): boolean {
  if (!userAgent) return false;
  
  const ua = userAgent.toLowerCase();
  console.log('Checking User-Agent:', userAgent, 'Lowercase:', ua);
  
  // More precise curl detection - only match actual curl/wget/httpie tools
  const isCurl = ua.startsWith('curl/') || 
                 ua === 'curl' ||
                 ua.startsWith('wget/') ||
                 ua === 'wget' ||
                 ua.startsWith('httpie/') ||
                 ua === 'httpie';
                 
  console.log('Is curl request?', isCurl);
  return isCurl;
}

// Text-only IP endpoint - guaranteed to work
app.get('/txt', async (c) => {
  const clientIP = getClientIP(c.req.raw);
  return c.text(clientIP + '\n', 200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
});

// Raw IP endpoint - alternative
app.get('/raw', async (c) => {
  const clientIP = getClientIP(c.req.raw);
  return c.text(clientIP, 200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
});

// IMPORTANT: Root route MUST be first - handles curl requests before any other routes
app.get('/', async (c) => {
  const userAgent = c.req.header('user-agent') || '';
  const accept = c.req.header('accept') || '';
  const clientIP = getClientIP(c.req.raw);
  
  console.log('Root route hit - User-Agent:', userAgent);
  console.log('Root route - Accept:', accept);
  console.log('Root route - Client IP:', clientIP);
  
  // Only return text for explicit curl requests or text/plain requests
  if (isCurlRequest(userAgent) || accept === 'text/plain') {
    console.log('Returning IP for curl/text request');
    return c.text(clientIP + '\n', 200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  
  console.log('Returning HTML for browser request');
  // For browser requests, return embedded HTML
  return c.html(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>I KNOW MY IP | IP Information Tool</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <meta name="description" content="View your IP address information instantly. Check DNS records, scan ports, and resolve domains with custom DNS servers." />
    
    <!-- OpenGraph / Social Media Sharing -->
    <meta property="og:title" content="I KNOW MY IP | IP Information Tool" />
    <meta property="og:description" content="View your IP address information instantly. Check DNS records, scan ports, and resolve domains with custom DNS servers." />
    <meta property="og:image" content="https://iknowmyip.com/assets/iknowlogo.png" />
    <meta property="og:url" content="https://iknowmyip.com" />
    <meta property="og:site_name" content="Now you know your IP address" />
    <meta property="og:type" content="website" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="I KNOW MY IP | IP Information Tool" />
    <meta name="twitter:description" content="View your IP address information instantly. Check DNS records, scan ports, and resolve domains with custom DNS servers." />
    <meta name="twitter:image" content="https://iknowmyip.com/assets/iknowlogo.png" />
    
    <!-- Additional metadata -->
    <meta name="theme-color" content="#7c3aed" />
    <script type="module" crossorigin src="/assets/index-nqet4VLz.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-cKtbz_UX.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`);
});

// API route for IP information
app.get('/api/ip', async (c) => {
  try {
    const clientIP = getClientIP(c.req.raw);
    const userAgent = c.req.header('user-agent') || '';
    
    // If the request is from cURL, return only the IP address as plain text
    if (isCurlRequest(userAgent)) {
      return c.text(clientIP + '\n', 200, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    }
    
    // For browser requests, get detailed IP info
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

// Serve static assets from build directory
app.get('/*', async (c) => {
  const url = new URL(c.req.url);
  const pathname = url.pathname;
  
  // Handle common static file requests
  if (pathname.startsWith('/assets/') || 
      pathname === '/favicon.png' || 
      pathname === '/sitemap.xml') {
    
    try {
      // Try to fetch from built assets (this will need to be adapted based on your setup)
      const response = await fetch(`https://iknowmyip.com${pathname}`);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.error('Error serving static asset:', error);
    }
  }
  
  // Return 404 for unknown routes
  return c.text('Not Found', 404);
});

export default app;