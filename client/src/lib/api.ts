import { 
  IPInfo, 
  DNSLookupParams, 
  DNSResult, 
  PortScanParams, 
  PortScanResult,
  DNSResolveParams,
  DNSResolveResult
} from "./types";
import { apiRequest } from "./queryClient";

// Fetch IP information
export async function fetchIpInfo(): Promise<IPInfo> {
  const response = await fetch('/api/ip', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to fetch IP info: ${response.status}`);
  }
  
  return response.json();
}

// DNS lookup function
export async function lookupDNS(params: DNSLookupParams): Promise<DNSResult> {
  const { domain, recordType } = params;
  
  // Make sure domain is properly formatted
  const formattedDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  const queryParams = new URLSearchParams({
    domain: formattedDomain,
    type: recordType
  });
  
  const response = await fetch(`/api/dns?${queryParams.toString()}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
    throw new Error(errorData.error || `DNS lookup failed: ${response.status}`);
  }
  
  return response.json();
}

// Port tarama fonksiyonu
export async function scanPort(params: PortScanParams): Promise<PortScanResult> {
  const response = await fetch('/api/port-scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
    throw new Error(errorData.error || `Port scan failed: ${response.status}`);
  }
  
  return response.json();
}

// DNS çözümleme fonksiyonu (özelleştirilebilir DNS sunucusuyla)
export async function resolveDomain(params: DNSResolveParams): Promise<DNSResolveResult> {
  // Make sure domain is properly formatted
  const formattedDomain = params.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  const payload = {
    domain: formattedDomain,
    dnsServer: params.dnsServer
  };
  
  const response = await fetch('/api/dns-resolve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
    throw new Error(errorData.error || `DNS resolve failed: ${response.status}`);
  }
  
  return response.json();
}
