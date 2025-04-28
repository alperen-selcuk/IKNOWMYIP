import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import dns from "dns";
import { promisify } from "util";
import axios from "axios";
import { Socket } from "net";
import { portScanSchema, dnsResolveSchema } from "../shared/schema";
import { z } from "zod";

// Promisify DNS methods
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolve4 = promisify(dns.resolve4);

// Helper function to determine if request is from cURL
function isCurlRequest(userAgent: string): boolean {
  return userAgent.toLowerCase().includes('curl');
}

// Get IP address from request
function getIpAddress(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return Array.isArray(forwardedFor) 
      ? forwardedFor[0] 
      : forwardedFor.split(',')[0];
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic route for IP information
  app.get('/api/ip', async (req: Request, res: Response) => {
    try {
      const ipAddress = getIpAddress(req);
      const userAgent = req.headers['user-agent'] || '';
      
      // If the request is from cURL, return only the IP address as plain text
      if (isCurlRequest(userAgent)) {
        return res.type('text/plain').send(ipAddress.replace(/%.*$/, ''));
      }
      
      // For browser requests, return detailed info
      // Use ipinfo.io to get IP details
      const ipResponse = await axios.get(`https://ipinfo.io/${ipAddress}/json`);
      
      // Save IP info to storage
      await storage.saveIpInfo({
        ipAddress,
        timestamp: new Date().toISOString(),
        userAgent
      });
      
      // Return the IP information
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
  });

  // Root route - handles curl requests, browser requests are handled by vite middleware
  app.get('/', (req: Request, res: Response, next: any) => {
    const userAgent = req.headers['user-agent'] || '';
    
    if (isCurlRequest(userAgent)) {
      const ipAddress = getIpAddress(req);
      // Temiz IP adresi döndür, yüzde işareti olmadan
      return res.type('text/plain').send(ipAddress.replace(/%.*$/, ''));
    }
    
    // For browser requests, pass to the next middleware (vite)
    next();
  });

  // DNS lookup route
  app.get('/api/dns', async (req: Request, res: Response) => {
    try {
      const domain = req.query.domain as string;
      const recordType = req.query.type as string;
      
      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }
      
      if (!recordType || !['A', 'MX', 'NS'].includes(recordType)) {
        return res.status(400).json({ error: 'Valid record type (A, MX, NS) is required' });
      }
      
      // Save the lookup to storage
      await storage.saveDnsLookup({
        domain,
        recordType,
        timestamp: new Date().toISOString(),
      });
      
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
  });

  // Port tarama endpoint'i
  app.post('/api/port-scan', async (req: Request, res: Response) => {
    try {
      // Gelen verileri doğrula
      const validationResult = portScanSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validationResult.error.format() 
        });
      }
      
      const { ipAddress, port } = validationResult.data;

      // Port tarama işlemini gerçekleştir
      const isOpen = await checkPortOpen(ipAddress, port);
      
      // Sonucu kaydet
      await storage.savePortScan(ipAddress, port, isOpen);
      
      // Sonucu döndür
      res.json({
        ipAddress,
        port,
        isOpen,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Port scan error:', error);
      res.status(500).json({ error: 'Failed to scan port' });
    }
  });

  // DNS sorgulama endpoint'i (özelleştirilebilir DNS sunucusuyla)
  app.post('/api/dns-resolve', async (req: Request, res: Response) => {
    try {
      // Gelen verileri doğrula
      const validationResult = dnsResolveSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validationResult.error.format() 
        });
      }
      
      const { domain, dnsServer } = validationResult.data;
      
      // DNS sunucusunu ayarla (varsayılan Google DNS - 8.8.8.8)
      const dnsResolverServer = dnsServer || '8.8.8.8';
      
      // özel DNS sunucusu kullanarak domain sorgusu yap
      dns.setServers([dnsResolverServer]);
      const ipAddresses = await resolve4(domain);
      
      // Sonucu kaydet
      await storage.saveDnsResolve(domain, dnsServer || null);
      
      // Sonucu döndür
      res.json({
        domain,
        dnsServer: dnsResolverServer,
        ipAddresses,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('DNS resolve error:', error);
      
      if ((error as NodeJS.ErrnoException).code === 'ENOTFOUND') {
        return res.status(404).json({ 
          error: 'Domain not found'
        });
      }
      
      res.status(500).json({ error: 'Failed to resolve domain' });
    }
  });

  // Port açık mı kontrol etme yardımcı fonksiyonu
  async function checkPortOpen(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new Socket();
      let isOpen = false;
      
      // Bağlantı zaman aşımı 
      socket.setTimeout(1500);
      
      // Bağlantı kurulursa port açıktır
      socket.on('connect', () => {
        isOpen = true;
        socket.destroy();
      });
      
      // Bağlantı hataları
      socket.on('error', () => {
        socket.destroy();
      });
      
      // Zaman aşımı
      socket.on('timeout', () => {
        socket.destroy();
      });
      
      // Socket kapatıldığında sonucu döndür
      socket.on('close', () => {
        resolve(isOpen);
      });
      
      // Bağlantıyı dene
      socket.connect(port, host);
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
