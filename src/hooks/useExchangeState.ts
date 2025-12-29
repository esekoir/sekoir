import { useState, useCallback } from 'react';
import { currencies, cryptos, golds, transfers } from '@/data/exchangeData';
import type { Language } from '@/data/translations';

export type CategoryType = 'currencies' | 'crypto' | 'gold' | 'transfers';

export const useExchangeState = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('ar');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('currencies');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calculator state
  const [calcAmount, setCalcAmount] = useState('');
  const [calcFrom, setCalcFrom] = useState('dzd');
  const [calcTo, setCalcTo] = useState('eur');
  const [calcResult, setCalcResult] = useState(0);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  }, []);

  const getFilteredItems = useCallback(() => {
    let items: any[] = [];
    
    switch (activeCategory) {
      case 'currencies':
        items = currencies;
        break;
      case 'crypto':
        items = cryptos;
        break;
      case 'gold':
        items = golds;
        break;
      case 'transfers':
        items = transfers;
        break;
    }

    if (showFavorites) {
      items = items.filter(item => favorites.includes(item.id));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.symbol.toLowerCase().includes(query)
      );
    }

    return items;
  }, [activeCategory, showFavorites, favorites, searchQuery]);

  const calculateExchange = useCallback(() => {
    const amount = parseFloat(calcAmount) || 0;
    const eurRate = 252;
    const usdRate = 228;
    
    let result = 0;
    
    if (calcFrom === 'dzd') {
      if (calcTo === 'eur') result = amount / eurRate;
      else if (calcTo === 'usd') result = amount / usdRate;
      else result = amount;
    } else if (calcFrom === 'eur') {
      if (calcTo === 'dzd') result = amount * eurRate;
      else if (calcTo === 'usd') result = amount * (eurRate / usdRate);
      else result = amount;
    } else if (calcFrom === 'usd') {
      if (calcTo === 'dzd') result = amount * usdRate;
      else if (calcTo === 'eur') result = amount * (usdRate / eurRate);
      else result = amount;
    }
    
    setCalcResult(result);
  }, [calcAmount, calcFrom, calcTo]);

  return {
    darkMode,
    language,
    activeCategory,
    showFavorites,
    favorites,
    searchQuery,
    calcAmount,
    calcFrom,
    calcTo,
    calcResult,
    setActiveCategory,
    setShowFavorites,
    setSearchQuery,
    setCalcAmount,
    setCalcFrom,
    setCalcTo,
    toggleDarkMode,
    toggleLanguage,
    toggleFavorite,
    getFilteredItems,
    calculateExchange,
  };
};
