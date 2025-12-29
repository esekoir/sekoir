import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useExchangeState } from '@/hooks/useExchangeState';
import ExchangeHeader from '@/components/exchange/ExchangeHeader';
import LiveTicker from '@/components/exchange/LiveTicker';
import CategoryTabs from '@/components/exchange/CategoryTabs';
import SearchBar from '@/components/exchange/SearchBar';
import ExchangeCalculator from '@/components/exchange/Calculator';
import BankCard from '@/components/exchange/BankCard';
import ItemCard from '@/components/exchange/ItemCard';

const Index = () => {
  const [loading, setLoading] = useState(true);
  
  const {
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
  } = useExchangeState();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <RefreshCw className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  const items = getFilteredItems();

  return (
    <div 
      className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50'}`} 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <ExchangeHeader
        darkMode={darkMode}
        language={language}
        onToggleDarkMode={toggleDarkMode}
        onToggleLanguage={toggleLanguage}
      />
      
      <LiveTicker />

      <div className="container mx-auto px-4 py-6">
        <BankCard language={language} />
        
        <ExchangeCalculator
          language={language}
          amount={calcAmount}
          from={calcFrom}
          to={calcTo}
          result={calcResult}
          onAmountChange={setCalcAmount}
          onFromChange={setCalcFrom}
          onToChange={setCalcTo}
          onCalculate={calculateExchange}
        />

        <CategoryTabs
          activeCategory={activeCategory}
          showFavorites={showFavorites}
          language={language}
          onCategoryChange={setActiveCategory}
          onToggleFavorites={() => setShowFavorites(!showFavorites)}
        />

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          language={language}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              category={activeCategory}
              language={language}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
