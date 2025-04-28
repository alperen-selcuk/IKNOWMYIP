import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Search, AlertCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { resolveDomain } from "@/lib/api";
import { DNSResolveResult } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

export default function DomainResolverCard() {
  const { t } = useLanguage();
  const [domain, setDomain] = useState("");
  const [dnsServer, setDnsServer] = useState("");
  const [result, setResult] = useState<DNSResolveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: resolveDomain,
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err: Error) => {
      setResult(null);
      setError(err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    // Simple validation
    if (!domain) {
      setError(t('validation.required_domain'));
      return;
    }
    
    // API call
    mutate({
      domain,
      dnsServer: dnsServer || undefined
    });
  };

  const renderResult = () => {
    if (error) {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      );
    }

    if (!result) {
      return null;
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">{t('resolver.results')}</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="font-medium text-gray-700 w-24">{t('resolver.domain_label')}</div>
            <div className="text-gray-900">{result.domain}</div>
          </div>
          <div className="flex items-center">
            <div className="font-medium text-gray-700 w-24">{t('resolver.dns_server_label')}</div>
            <div className="text-gray-900">{result.dnsServer}</div>
          </div>
          <div className="mt-2">
            <div className="font-medium text-gray-700 mb-1">{t('resolver.ip_addresses')}</div>
            <div className="bg-white border border-gray-200 rounded-md divide-y">
              {result.ipAddresses.length > 0 ? (
                result.ipAddresses.map((ip, index) => (
                  <div key={index} className="p-2 text-gray-800">{ip}</div>
                ))
              ) : (
                <div className="p-2 text-gray-500">{t('resolver.no_results')}</div>
              )}
            </div>
          </div>
          <div className="flex items-center mt-2">
            <div className="font-medium text-gray-700 w-24">{t('resolver.time')}</div>
            <div className="text-gray-900">
              {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-amber-500 to-orange-600">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          {t('resolver.title')}
        </h2>
      </div>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              {t('resolver.domain')}
            </Label>
            <Input
              id="domain"
              type="text"
              placeholder={t('resolver.domain_placeholder')}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="dnsServer" className="block text-sm font-medium text-gray-700 mb-1">
              {t('resolver.dns_server')}
            </Label>
            <Input
              id="dnsServer"
              type="text"
              placeholder={t('resolver.dns_placeholder')}
              value={dnsServer}
              onChange={(e) => setDnsServer(e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('resolver.dns_default')}
            </p>
          </div>
          
          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? <Activity className="h-4 w-4 animate-spin mr-2" /> : null}
            {isPending ? t('resolver.resolving') : t('resolver.resolve')}
          </Button>
        </form>
        
        {renderResult()}
        
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-emerald-600">
            <h2 className="text-sm font-semibold text-white flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              {t('resolver.popular_title')}
            </h2>
          </div>
          <div className="p-4 text-sm">
            <ul className="space-y-2">
              <li><strong className="font-medium">{t('resolver.google_dns')}</strong> 8.8.8.8, 8.8.4.4</li>
              <li><strong className="font-medium">{t('resolver.cloudflare')}</strong> 1.1.1.1, 1.0.0.1</li>
              <li><strong className="font-medium">{t('resolver.quad9')}</strong> 9.9.9.9, 149.112.112.112</li>
              <li><strong className="font-medium">{t('resolver.opendns')}</strong> 208.67.222.222, 208.67.220.220</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}