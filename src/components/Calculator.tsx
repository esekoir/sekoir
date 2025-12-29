import React, { useState, useMemo } from 'react';
import { X, Calculator as CalcIcon, ArrowRightLeft } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  rates: Record<string, number>;
  language: 'ar' | 'en';
}

export const ConverterCalculator: React.FC<CalculatorProps> = ({
  isOpen,
  onClose,
  rates,
  language,
}) => {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('eur');
  const [toCurrency, setToCurrency] = useState('dzd');

  const t = {
    title: language === 'ar' ? 'حاسبة التحويل' : 'Currency Calculator',
    amount: language === 'ar' ? 'المبلغ' : 'Amount',
    from: language === 'ar' ? 'من' : 'From',
    to: language === 'ar' ? 'إلى' : 'To',
    result: language === 'ar' ? 'النتيجة' : 'Result',
    estimate: language === 'ar' ? '* الأسعار تقديرية' : '* Estimated prices',
  };

  const currencies = [
    { code: 'dzd', name: 'DZD' },
    { code: 'eur', name: 'EUR' },
    { code: 'usd', name: 'USD' },
    { code: 'gbp', name: 'GBP' },
  ];

  const result = useMemo(() => {
    if (fromCurrency === toCurrency) return amount;
    
    let dzdAmount = amount;
    
    // Convert to DZD first
    if (fromCurrency !== 'dzd') {
      const rate = rates[fromCurrency.toUpperCase()] || 1;
      dzdAmount = amount / rate;
    }
    
    // Then convert from DZD to target
    if (toCurrency !== 'dzd') {
      const rate = rates[toCurrency.toUpperCase()] || 1;
      return dzdAmount * rate;
    }
    
    return dzdAmount;
  }, [amount, fromCurrency, toCurrency, rates]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-card shadow-2xl border-b-2 border-primary/30 animate-in slide-in-from-top duration-300">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <CalcIcon size={24} className="text-primary" />
            {t.title}
          </h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              {t.amount}
            </label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary focus:outline-none bg-background text-foreground transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              {t.from}
            </label>
            <select 
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary focus:outline-none bg-background text-foreground transition-colors"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={swapCurrencies}
              className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all hover:scale-110"
            >
              <ArrowRightLeft size={20} />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              {t.to}
            </label>
            <select 
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary focus:outline-none bg-background text-foreground transition-colors"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              {t.result}
            </label>
            <div className="w-full px-4 py-3 bg-primary/10 border-2 border-primary/30 rounded-xl font-bold text-primary text-lg animate-glow">
              {result.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">{t.estimate}</p>
      </div>
    </div>
  );
};
