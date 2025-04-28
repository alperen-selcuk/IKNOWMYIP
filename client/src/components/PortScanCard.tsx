import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NetworkIcon, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { scanPort } from "@/lib/api";
import { PortScanResult } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

export default function PortScanCard() {
  const { t } = useLanguage();
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState<number | string>("");
  const [result, setResult] = useState<PortScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: scanPort,
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
    if (!ipAddress) {
      setError(t('validation.required_ip'));
      return;
    }
    
    if (!port) {
      setError(t('validation.required_port'));
      return;
    }
    
    const portNum = Number(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError(t('validation.invalid_port'));
      return;
    }
    
    // API call
    mutate({
      ipAddress,
      port: portNum
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
        <h3 className="text-sm font-medium text-gray-900 mb-2">{t('portscan.results')}</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="font-medium text-gray-700 w-24">{t('portscan.ip')}</div>
            <div className="text-gray-900">{result.ipAddress}</div>
          </div>
          <div className="flex items-center">
            <div className="font-medium text-gray-700 w-24">{t('portscan.port_label')}</div>
            <div className="text-gray-900">{result.port}</div>
          </div>
          <div className="flex items-center">
            <div className="font-medium text-gray-700 w-24">{t('portscan.status')}</div>
            <div className={`flex items-center ${result.isOpen ? 'text-green-600' : 'text-red-600'}`}>
              {result.isOpen ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span> {t('portscan.open')}
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span> {t('portscan.closed')}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="font-medium text-gray-700 w-24">{t('portscan.time')}</div>
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
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-rose-600 to-pink-700">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <NetworkIcon className="mr-2 h-5 w-5" />
          {t('portscan.title')}
        </h2>
      </div>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">
              {t('portscan.ip_address')}
            </Label>
            <Input
              id="ipAddress"
              type="text"
              placeholder={t('portscan.ip_placeholder')}
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
              {t('portscan.port')}
            </Label>
            <Input
              id="port"
              type="number"
              min="1"
              max="65535"
              placeholder={t('portscan.port_placeholder')}
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('portscan.port_examples')}
            </p>
          </div>
          
          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending ? <Activity className="h-4 w-4 animate-spin mr-2" /> : null}
            {isPending ? t('portscan.scanning') : t('portscan.scan')}
          </Button>
        </form>
        
        {renderResult()}
        
        <div className="mt-6 text-sm text-gray-500">
          <p className="flex items-center">
            <AlertCircle className="inline-block mr-1 text-amber-500 h-4 w-4" />
            {t('portscan.notice')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}