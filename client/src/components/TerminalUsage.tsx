import { Card, CardContent } from "@/components/ui/card";
import { Terminal, Zap, Copy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TerminalUsage() {
  const currentLocation = window.location.origin;
  const { t } = useLanguage();
  const { toast } = useToast();

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command)
      .then(() => {
        toast({
          title: t('terminal.copied'),
          description: t('terminal.copy_success'),
          variant: "default",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: t('terminal.copy_error'),
          variant: "destructive",
        });
      });
  };

  const commands = [
    { cmd: `curl ${currentLocation}/ip`, desc: t('terminal.primary') },
    { cmd: `curl ${currentLocation}/myip`, desc: t('terminal.alternative') },
    { cmd: `curl ${currentLocation}/getip`, desc: t('terminal.alternative') },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-green-700">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Terminal className="mr-2 h-5 w-5" />
          {t('terminal.title')}
        </h2>
      </div>
      
      <CardContent className="p-6">
        <p className="text-gray-600 mb-4">
          {t('terminal.description')}
        </p>
        
        <div className="space-y-3">
          {commands.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-md p-4 overflow-x-auto">
              <div className="flex items-center justify-between">
                <code className="text-green-400 font-mono text-sm flex-1">{item.cmd}</code>
                <Button 
                  onClick={() => copyCommand(item.cmd)} 
                  size="sm" 
                  variant="ghost" 
                  className="ml-2 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-600 font-mono">
            {t('terminal.output')}: <span className="text-green-600">31.145.161.76</span>
          </p>
        </div>
        