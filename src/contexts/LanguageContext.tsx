import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  toggleDarkMode: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [darkMode, setDarkModeState] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const savedLang = localStorage.getItem('language') as Language;
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedLang) setLanguageState(savedLang);
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkModeState(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
  };

  const setDarkMode = (mode: boolean) => {
    setDarkModeState(mode);
    localStorage.setItem('darkMode', mode.toString());
    if (mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      toggleLanguage, 
      darkMode, 
      setDarkMode, 
      toggleDarkMode 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
