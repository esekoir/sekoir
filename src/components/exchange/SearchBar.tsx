import React from 'react';
import { Search } from 'lucide-react';
import type { Language } from '@/data/translations';
import { translations } from '@/data/translations';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, language }) => {
  const t = translations[language];

  return (
    <div className="relative mb-6">
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder={t.search}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
};

export default SearchBar;
