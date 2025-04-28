import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleHelp, Copy, Check } from "lucide-react";
import { IPInfo } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

interface IPInfoCardProps {
  ipData: IPInfo | undefined;
  isLoading: boolean;
  error: Error | null;
}

export default function IPInfoCard({ ipData, isLoading, error }: IPInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: t('ipinfo.copied'),
        description: t('ipinfo.copy_success'),
        duration: 2000,
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(err => {
      toast({
        title: "Error",
        description: t('ipinfo.copy_error'),
        variant: "destructive",
        duration: 2000,
      });
    });
  };
  
  const renderRow = (labelKey: string, value: string | undefined, copyable: boolean = false) => (
    <div className="flex justify-between py-4 items-center">
      <span className="text-gray-500 font-medium">{t(labelKey)}</span>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-32" />
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-gray-900 font-semibold">{value || 'N/A'}</span>
          {copyable && value && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => copyToClipboard(value)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const getBrowser = () => {
    if (!ipData?.userAgent) return 'N/A';
    
    const userAgent = ipData.userAgent.toLowerCase();
    
    if (userAgent.includes('firefox')) return 'Firefox';
    if (userAgent.includes('edg')) return 'Microsoft Edge';
    if (userAgent.includes('chrome')) return 'Chrome';
    if (userAgent.includes('safari')) return 'Safari';
    if (userAgent.includes('opera')) return 'Opera';
    
    return 'Unknown';
  };
  
  const getOS = () => {
    if (!ipData?.userAgent) return 'N/A';
    
    const userAgent = ipData.userAgent.toLowerCase();
    
    if (userAgent.includes('windows')) return 'Windows';
    if (userAgent.includes('mac os')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('ios') || userAgent.includes('iphone')) return 'iOS';
    
    return 'Unknown';
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-cyan-600 to-blue-700">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <CircleHelp className="mr-2 h-5 w-5" />
          {t('ipinfo.title')}
        </h2>
      </div>
      
      <CardContent className="p-0">
        <div className="p-6 divide-y divide-gray-200">
          {renderRow('ipinfo.ip_address', ipData?.ip, true)}
          {renderRow('ipinfo.location', ipData?.info?.city && ipData?.info?.country 
            ? `${ipData.info.city}, ${ipData.info.country}` 
            : ipData?.info?.country || 'N/A')}
          {renderRow('ipinfo.isp', ipData?.info?.org)}
          {renderRow('ipinfo.browser', getBrowser())}
          {renderRow('ipinfo.os', getOS())}
          {renderRow('ipinfo.timezone', ipData?.info?.timezone)}
          {renderRow('ipinfo.datetime', ipData ? formatDate(new Date()) : 'N/A')}
        </div>
        
        <div className="bg-gray-50 px-6 py-4">
          <div className="font-medium text-sm text-gray-500">
            <CircleHelp className="inline-block mr-1 text-secondary-500 h-4 w-4" />
            {t('ipinfo.notice')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
