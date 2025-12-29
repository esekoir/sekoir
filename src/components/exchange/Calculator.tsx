import React, { useEffect, useRef } from 'react';
import { Calculator as CalcIcon, ArrowLeftRight } from 'lucide-react';
import type { Language } from '@/data/translations';
import { translations } from '@/data/translations';

interface CalculatorProps {
  language: Language;
  amount: string;
  from: string;
  to: string;
  result: number;
  onAmountChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onCalculate: () => void;
}

const ExchangeCalculator: React.FC<CalculatorProps> = ({
  language,
  amount,
  from,
  to,
  result,
  onAmountChange,
  onFromChange,
  onToChange,
  onCalculate,
}) => {
  const t = translations[language];
  const inputRef = useRef<HTMLInputElement>(null);
  const isCalculating = useRef(false);

  useEffect(() => {
    if (!isCalculating.current) {
      isCalculating.current = true;
      // Use requestAnimationFrame to avoid blocking input
      requestAnimationFrame(() => {
        onCalculate();
        isCalculating.current = false;
      });
    }
  }, [amount, from, to]);

  const handleFocus = () => {
    if (amount === '0' || amount === '') {
      onAmountChange('');
    }
  };

  const handleBlur = () => {
    if (amount === '') {
      onAmountChange('0');
    }
  };

  const currencyOptions = [
    { value: 'dzd', label: 'DZD - دينار جزائري' },
    { value: 'eur', label: 'EUR - يورو' },
    { value: 'usd', label: 'USD - دولار' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-6">
      <div className="flex items-center gap-2 mb-4">
        <CalcIcon className="text-emerald-500" size={24} />
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t.calculator}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t.amount}</label>
          <input
            ref={inputRef}
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent caret-emerald-500"
            style={{ caretColor: 'auto' }}
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t.from}</label>
          <select
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
          >
            {currencyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-center">
          <ArrowLeftRight className="text-emerald-500" size={24} />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t.to}</label>
          <select
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
          >
            {currencyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl text-white">
        <div className="text-sm opacity-80">{t.result}</div>
        <div className="text-2xl font-bold">
          {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {to.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default ExchangeCalculator;
