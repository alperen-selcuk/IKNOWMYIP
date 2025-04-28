import { Card, CardContent } from "@/components/ui/card";
import { Terminal, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TerminalUsage() {
  const currentLocation = window.location.origin;
  const { t } = useLanguage();

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
        
        <div className="bg-gray-800 rounded-md p-4 overflow-x-auto">
          <code className="text-green-400 font-mono text-sm">curl {currentLocation}</code>
        </div>
        
        <p className="text-gray-500 text-sm mt-3 flex items-center">
          <Zap className="h-4 w-4 text-yellow-500 mr-1" />
          {t('terminal.note')}
        </p>
      </CardContent>
    </Card>
  );
}
