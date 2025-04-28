import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IPInfo } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface IPHeaderProps {
  ipData: IPInfo | undefined;
  isLoading: boolean;
}

export default function IPHeader({ ipData, isLoading }: IPHeaderProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleCopyIP = () => {
    if (ipData?.ip) {
      navigator.clipboard.writeText(ipData.ip)
        .then(() => {
          toast({
            title: t('ipinfo.copied'),
            description: t('ipinfo.copy_success'),
            variant: "default",
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: t('ipinfo.copy_error'),
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className="py-6 w-full flex justify-center">
      <Card className="overflow-hidden max-w-xl w-full border-2 border-purple-200 shadow-lg">
        <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-center">
          <h2 className="text-sm font-medium text-purple-100 mb-2">
            {t('ipheader.title')}
          </h2>
          {isLoading ? (
            <div className="flex justify-center">
              <Skeleton className="h-12 w-48" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div className="font-mono text-3xl font-bold tracking-wider text-white">
                {ipData?.ip || 'N/A'}
              </div>
              {ipData?.ip && (
                <Button 
                  onClick={handleCopyIP} 
                  size="sm" 
                  variant="ghost" 
                  className="rounded-full w-8 h-8 p-0 text-white hover:bg-white/20"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}