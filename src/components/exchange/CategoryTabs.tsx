import React from 'react';
import { Coins, Bitcoin, CircleDollarSign, ArrowLeftRight, Star } from 'lucide-react';
import type { CategoryType } from '@/hooks/useExchangeState';
import { translations, type Language } from '@/data/translations';

interface CategoryTabsProps {
  activeCategory: CategoryType;
  showFavorites: boolean;
  language: Language;
  onCategoryChange: (category: CategoryType) => void;
  onToggleFavorites: () => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  showFavorites,
  language,
  onCategoryChange,
  onToggleFavorites,
}) => {
  const t = translations[language];
  
  const categories = [
    { id: 'currencies' as CategoryType, label: t.currencies, icon: Coins },
    { id: 'crypto' as CategoryType, label: t.crypto, icon: Bitcoin },
    { id: 'gold' as CategoryType, label: t.gold, icon: CircleDollarSign },
    { id: 'transfers' as CategoryType, label: t.transfers, icon: ArrowLeftRight },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onCategoryChange(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            activeCategory === id
              ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow'
          }`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
      
      <button
        onClick={onToggleFavorites}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
          showFavorites
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow'
        }`}
      >
        <Star size={18} fill={showFavorites ? 'currentColor' : 'none'} />
        <span>{t.favorites}</span>
      </button>
    </div>
  );
};

export default CategoryTabs;
