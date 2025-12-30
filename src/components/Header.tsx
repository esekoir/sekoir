import React from 'react';
import { DollarSign, Moon, Sun, Calculator, Shield } from 'lucide-react';
import { LiveClock } from './LiveClock';
import { LiveIndicator } from './LiveIndicator';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminPanel } from './AdminPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface HeaderProps {
  language: 'ar' | 'en';
  darkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onToggleCalculator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  darkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onToggleCalculator,
}) => {
  const { isAdmin } = useAdmin();
  
  const t = {
    title: 'E-Sekoir',
    subtitle: language === 'ar' ? 'منصة الصرف الشاملة' : 'Complete Exchange Platform',
  };

  return (
    <header className="bg-gradient-to-r from-primary via-primary to-emerald-600 text-primary-foreground shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 animate-float">
              <DollarSign size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">{t.title}</h1>
                <LiveIndicator />
              </div>
              <p className="text-xs text-emerald-100">{t.subtitle}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            <LiveClock />
            
            <button 
              onClick={onToggleDarkMode}
              className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all hover:scale-105"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={onToggleLanguage}
              className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all hover:scale-105"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            
            <button 
              onClick={onToggleCalculator}
              className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all hover:scale-105"
              aria-label="Calculator"
            >
              <Calculator size={20} />
            </button>
            
            {isAdmin && (
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    className="bg-yellow-500/30 p-2 rounded-lg hover:bg-yellow-500/50 transition-all hover:scale-105"
                    aria-label="Admin Panel"
                  >
                    <Shield size={20} />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <Shield className="h-5 w-5" />
                      لوحة التحكم
                    </DialogTitle>
                  </DialogHeader>
                  <AdminPanel />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
