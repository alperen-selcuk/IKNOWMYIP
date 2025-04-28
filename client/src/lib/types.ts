export interface IPInfo {
  ip: string;
  info: {
    ip: string;
    hostname?: string;
    city?: string;
    region?: string;
    country?: string;
    loc?: string;
    org?: string;
    postal?: string;
    timezone?: string;
  };
  userAgent: string;
  datetime: string;
}

export interface DNSRecord {
  value: string;
  ttl: number;
  priority?: number;
}

export interface DNSResult {
  domain: string;
  recordType: string;
  results: DNSRecord[];
  timestamp: string;
}

export interface DNSLookupParams {
  domain: string;
  recordType: string;
}

// Port Tarama için tipler
export interface PortScanParams {
  ipAddress: string;
  port: number;
}

export interface PortScanResult {
  ipAddress: string;
  port: number;
  isOpen: boolean;
  timestamp: string;
}

// Özelleştirilebilir DNS Sunucusuyla Sorgulama için tipler
export interface DNSResolveParams {
  domain: string;
  dnsServer?: string; // Opsiyonel, varsayılan olarak Google DNS (8.8.8.8) kullanılacak
}

export interface DNSResolveResult {
  domain: string;
  dnsServer: string;
  ipAddresses: string[];
  timestamp: string;
}
