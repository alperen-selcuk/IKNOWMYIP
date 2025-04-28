import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'app.subtitle': 'Browser and Terminal IP Information Tool',
    
    // IP Header
    'ipheader.title': 'YOUR IP ADDRESS',
    
    // IP Info Card
    'ipinfo.title': 'IP Information',
    'ipinfo.ip_address': 'IP Address',
    'ipinfo.location': 'Location',
    'ipinfo.isp': 'ISP',
    'ipinfo.browser': 'Browser',
    'ipinfo.os': 'Operating System',
    'ipinfo.timezone': 'Timezone',
    'ipinfo.datetime': 'Date/Time',
    'ipinfo.notice': 'Your IP information is for viewing purposes only and is not stored.',
    'ipinfo.copied': 'Copied!',
    'ipinfo.copy_success': 'IP address copied to clipboard.',
    'ipinfo.copy_error': 'Copy operation failed.',
    
    // Terminal Usage
    'terminal.title': 'Terminal Usage',
    'terminal.description': 'You can view your IP address via terminal using the following command:',
    'terminal.note': 'This command will return only your IP address, without any HTML content.',
    
    // DNS Lookup
    'dns.title': 'DNS Records Lookup',
    'dns.domain': 'Domain Name',
    'dns.placeholder': 'e.g. google.com',
    'dns.lookup': 'Lookup',
    'dns.results': 'Results',
    'dns.help_title': 'Help',
    'dns.a_record': 'A Record: Maps a domain name to an IP address.',
    'dns.mx_record': 'MX Record: Identifies mail servers.',
    'dns.ns_record': 'NS Record: Identifies the authoritative name servers for a domain.',
    
    // Port Scan
    'portscan.title': 'Port Scanner',
    'portscan.ip_address': 'IP Address',
    'portscan.ip_placeholder': 'e.g. 8.8.8.8',
    'portscan.port': 'Port Number',
    'portscan.port_placeholder': 'e.g. 80',
    'portscan.port_examples': 'Example port numbers: 80 (HTTP), 443 (HTTPS), 22 (SSH), 21 (FTP)',
    'portscan.scan': 'Scan Port',
    'portscan.scanning': 'Scanning...',
    'portscan.results': 'Result',
    'portscan.ip': 'IP Address:',
    'portscan.port_label': 'Port:',
    'portscan.status': 'Status:',
    'portscan.open': 'Open',
    'portscan.closed': 'Closed',
    'portscan.time': 'Time:',
    'portscan.notice': 'You can only scan ports on accessible servers. A simple TCP connection test is performed.',
    
    // Domain Resolver
    'resolver.title': 'Domain Resolver with Custom DNS',
    'resolver.domain': 'Domain Name',
    'resolver.domain_placeholder': 'e.g. google.com',
    'resolver.dns_server': 'DNS Server (Optional)',
    'resolver.dns_placeholder': 'e.g. 8.8.8.8',
    'resolver.dns_default': 'If left empty, Google DNS (8.8.8.8) will be used.',
    'resolver.resolve': 'Resolve Domain',
    'resolver.resolving': 'Resolving...',
    'resolver.results': 'Result',
    'resolver.domain_label': 'Domain:',
    'resolver.dns_server_label': 'DNS Server:',
    'resolver.ip_addresses': 'IP Addresses:',
    'resolver.time': 'Time:',
    'resolver.no_results': 'No results found',
    'resolver.popular_title': 'Popular DNS Servers',
    'resolver.google_dns': 'Google DNS:',
    'resolver.cloudflare': 'Cloudflare:',
    'resolver.quad9': 'Quad9:',
    'resolver.opendns': 'OpenDNS:',
    
    // Form validation
    'validation.required_ip': 'IP address is required.',
    'validation.required_port': 'Port number is required.',
    'validation.invalid_port': 'Please enter a valid port number (1-65535).',
    'validation.required_domain': 'Domain name is required.',
    
    // Errors
    'error.dns_lookup': 'DNS lookup failed',
    'error.port_scan': 'Port scan failed',
    'error.domain_resolve': 'Failed to resolve domain',
    'error.domain_not_found': 'Domain not found',
    
    // Footer
    'footer.copyright': 'All rights reserved.',
    'footer.educational': 'This site is created for educational purposes only.',
    
    // Language
    'language.switch_to_turkish': 'Türkçe',
  },
  tr: {
    // Navbar
    'app.subtitle': 'Browser ve Terminal IP Bilgi Aracı',
    
    // IP Header
    'ipheader.title': 'SİZİN IP ADRESİNİZ',
    
    // IP Info Card
    'ipinfo.title': 'IP Bilgileri',
    'ipinfo.ip_address': 'IP Adresi',
    'ipinfo.location': 'Konum',
    'ipinfo.isp': 'ISP',
    'ipinfo.browser': 'Tarayıcı',
    'ipinfo.os': 'İşletim Sistemi',
    'ipinfo.timezone': 'Saat Dilimi',
    'ipinfo.datetime': 'Tarih/Saat',
    'ipinfo.notice': 'IP bilgileriniz sadece görüntüleme amaçlıdır ve saklanmaz.',
    'ipinfo.copied': 'Kopyalandı!',
    'ipinfo.copy_success': 'IP adresi panoya kopyalandı.',
    'ipinfo.copy_error': 'Kopyalama işlemi başarısız oldu.',
    
    // Terminal Usage
    'terminal.title': 'Terminal Kullanımı',
    'terminal.description': 'IP adresinizi terminal üzerinden görüntülemek için aşağıdaki komutu kullanabilirsiniz:',
    'terminal.note': 'Bu komut sadece IP adresinizi döndürecektir, herhangi bir HTML içerik olmadan.',
    
    // DNS Lookup
    'dns.title': 'DNS Kayıtları Sorgulama',
    'dns.domain': 'Alan Adı',
    'dns.placeholder': 'örn: google.com',
    'dns.lookup': 'Sorgula',
    'dns.results': 'Sonuçlar',
    'dns.help_title': 'Yardım',
    'dns.a_record': 'A Kaydı: Bir alan adını IP adresine yönlendirir.',
    'dns.mx_record': 'MX Kaydı: E-posta sunucularını belirler.',
    'dns.ns_record': 'NS Kaydı: Alan adının yetkili isim sunucularını belirler.',
    
    // Port Scan
    'portscan.title': 'Port Tarama',
    'portscan.ip_address': 'IP Adresi',
    'portscan.ip_placeholder': 'örn: 8.8.8.8',
    'portscan.port': 'Port Numarası',
    'portscan.port_placeholder': 'örn: 80',
    'portscan.port_examples': 'Örnek port numaraları: 80 (HTTP), 443 (HTTPS), 22 (SSH), 21 (FTP)',
    'portscan.scan': 'Portu Tara',
    'portscan.scanning': 'Taranıyor...',
    'portscan.results': 'Sonuç',
    'portscan.ip': 'IP Adresi:',
    'portscan.port_label': 'Port:',
    'portscan.status': 'Durum:',
    'portscan.open': 'Açık',
    'portscan.closed': 'Kapalı',
    'portscan.time': 'Zaman:',
    'portscan.notice': 'Yalnızca erişilebilir sunuculara port taraması yapabilirsiniz. Basit bir TCP bağlantı testi yapılmaktadır.',
    
    // Domain Resolver
    'resolver.title': 'Özel DNS ile Domain Sorgulama',
    'resolver.domain': 'Domain Adı',
    'resolver.domain_placeholder': 'örn: google.com',
    'resolver.dns_server': 'DNS Sunucusu (Opsiyonel)',
    'resolver.dns_placeholder': 'örn: 8.8.8.8',
    'resolver.dns_default': 'Boş bırakırsanız Google DNS (8.8.8.8) kullanılacaktır.',
    'resolver.resolve': 'Domain Sorgula',
    'resolver.resolving': 'Sorgulanıyor...',
    'resolver.results': 'Sonuç',
    'resolver.domain_label': 'Domain:',
    'resolver.dns_server_label': 'DNS Sunucusu:',
    'resolver.ip_addresses': 'IP Adresleri:',
    'resolver.time': 'Zaman:',
    'resolver.no_results': 'Sonuç bulunamadı',
    'resolver.popular_title': 'Popüler DNS Sunucuları',
    'resolver.google_dns': 'Google DNS:',
    'resolver.cloudflare': 'Cloudflare:',
    'resolver.quad9': 'Quad9:',
    'resolver.opendns': 'OpenDNS:',
    
    // Form validation
    'validation.required_ip': 'IP adresi gereklidir.',
    'validation.required_port': 'Port numarası gereklidir.',
    'validation.invalid_port': 'Geçerli bir port numarası giriniz (1-65535).',
    'validation.required_domain': 'Domain adı gereklidir.',
    
    // Errors
    'error.dns_lookup': 'DNS sorgusu başarısız oldu',
    'error.port_scan': 'Port tarama başarısız oldu',
    'error.domain_resolve': 'Domain çözümleme başarısız oldu',
    'error.domain_not_found': 'Domain bulunamadı',
    
    // Footer
    'footer.copyright': 'Tüm hakları saklıdır.',
    'footer.educational': 'Bu site tamamen eğitim amaçlı hazırlanmıştır.',
    
    // Language
    'language.switch_to_turkish': 'English',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};