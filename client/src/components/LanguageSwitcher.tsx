import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  return (
    <Button 
      onClick={toggleLanguage} 
      variant="ghost" 
      size="sm" 
      className="text-white hover:text-white/80 hover:bg-white/10"
    >
      {language === 'en' ? (
        <>
          <span className="mr-2">🇹🇷</span>
          {t('language.switch_to_turkish')}
        </>
      ) : (
        <>
          <span className="mr-2">🇬🇧</span>
          {t('language.switch_to_turkish')}
        </>
      )}
    </Button>
  );
}