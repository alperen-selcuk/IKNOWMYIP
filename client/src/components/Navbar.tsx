import { Globe, Network } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const { t, language } = useLanguage();
  
  return (
    <nav className="bg-gradient-to-r from-purple-700 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="mr-3 p-2 bg-white rounded-full shadow-md">
                <Network className="text-purple-700 h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-white tracking-tight uppercase">
                  I KNOW MY IP
                </span>
                <span className="text-sm font-medium mt-1 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-300">
                  {language === 'en' ? 'Now you know your IP address' : 'Artık IP adresinizi biliyorsunuz'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex sm:items-center">
              <div className="text-sm text-purple-100">
                <span>{t('app.subtitle')}</span>
              </div>
            </div>
            
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
