import React from 'react';
import { DollarSign, Moon, Sun, Globe } from 'lucide-react';
import type { Language } from '@/data/translations';
import { translations } from '@/data/translations';

interface ExchangeHeaderProps {
  darkMode: boolean;
  language: Language;
  onToggleDarkMode: () => void;
  onToggleLanguage: () => void;
}

const ExchangeHeader: React.FC<ExchangeHeaderProps> = ({
  darkMode,
  language,
  onToggleDarkMode,
  onToggleLanguage,
}) => {
  const t = translations[language];

  return (
    <header className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <DollarSign size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{t.appName}</h1>
              <p className="text-xs text-emerald-100">{t.appDescription}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLanguage}
              className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Globe size={20} />
            </button>
            <button
              onClick={onToggleDarkMode}
              className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExchangeHeader;
