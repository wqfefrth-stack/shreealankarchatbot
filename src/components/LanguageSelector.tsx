
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  onLanguageSelect: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect }) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    onLanguageSelect();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-96 mx-4 shadow-2xl border-2 border-amber-600/20 bg-card">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <img 
              src="/lovable-uploads/df89ad8d-4e94-4d53-813b-4e057004190e.png" 
              alt="Shree Alankar Logo" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('language.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('language.select')}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => handleLanguageChange('english')}
              variant={language === 'english' ? 'default' : 'outline'}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {t('language.english')}
            </Button>
            
            <Button
              onClick={() => handleLanguageChange('marathi')}
              variant={language === 'marathi' ? 'default' : 'outline'}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {t('language.marathi')}
            </Button>
          </div>
          
          <Button
            onClick={onLanguageSelect}
            className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {t('language.continue')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelector;
