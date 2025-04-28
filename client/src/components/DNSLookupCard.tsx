import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Loader2, HelpCircle } from "lucide-react";
import { lookupDNS } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { DNSResult } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

export default function DNSLookupCard() {
  const { t } = useLanguage();
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("A");
  const [results, setResults] = useState<DNSResult | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: lookupDNS,
    onSuccess: (data) => {
      setResults(data);
    },
    onError: (error) => {
      toast({
        title: t('error.dns_lookup'),
        description: error instanceof Error ? error.message : "Lookup failed. Please try again.",
        variant: "destructive"
      });
      setResults(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      toast({
        title: t('validation.required_domain'),
        description: "Please enter a domain to lookup.",
        variant: "destructive"
      });
      return;
    }
    
    mutate({ domain, recordType });
  };

  const renderResults = () => {
    if (isPending) {
      return (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      );
    }

    if (!results) {
      return (
        <div className="text-center text-gray-400 italic py-8">
          Enter a domain name and click "Lookup" to see results.
        </div>
      );
    }

    return (
      <div>
        <div className="mb-3">
          <span className="font-medium text-gray-900">{results.domain}</span>
          <span className="text-gray-500 ml-2">{results.recordType} records</span>
        </div>

        {results.results && results.results.length > 0 ? (
          <div className="space-y-2">
            {results.results.map((result, index) => (
              <div key={index} className="flex items-start">
                {recordType === 'MX' && (
                  <span className="text-secondary-600 font-mono">{result.priority}</span>
                )}
                <span className={`${recordType === 'MX' ? 'ml-3' : ''} text-gray-900`}>{result.value}</span>
                <span className="ml-auto text-gray-500">TTL: {result.ttl}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            No records found.
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-700 to-violet-800">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Search className="mr-2 h-5 w-5" />
          {t('dns.title')}
        </h2>
      </div>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              {t('dns.domain')}
            </Label>
            <div className="flex">
              <Input
                id="domain"
                type="text"
                placeholder={t('dns.placeholder')}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="ml-3" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('dns.lookup')}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <RadioGroup
              value={recordType}
              onValueChange={setRecordType}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="A" />
                <Label htmlFor="A" className="text-sm text-gray-700">A Record</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MX" id="MX" />
                <Label htmlFor="MX" className="text-sm text-gray-700">MX Record</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NS" id="NS" />
                <Label htmlFor="NS" className="text-sm text-gray-700">NS Record</Label>
              </div>
            </RadioGroup>
          </div>
        </form>

        <div className="mt-6">
          <div className="border border-gray-200 rounded-md bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">{t('dns.results')}</h3>
            <div id="lookup-results" className="text-sm text-gray-600 min-h-[200px]">
              {renderResults()}
            </div>
          </div>
        </div>

        {/* Help section */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              {t('dns.help_title')}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 text-sm text-gray-600">
              <p><strong className="font-medium text-gray-900">{t('dns.a_record')}</strong></p>
              <p><strong className="font-medium text-gray-900">{t('dns.mx_record')}</strong></p>
              <p><strong className="font-medium text-gray-900">{t('dns.ns_record')}</strong></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
