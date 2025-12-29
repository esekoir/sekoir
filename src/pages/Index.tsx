import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { PriceTicker } from '@/components/PriceTicker';
import { ConverterCalculator } from '@/components/Calculator';
import { CurrencyCard } from '@/components/CurrencyCard';
import { CryptoCard } from '@/components/CryptoCard';
import { GoldCard } from '@/components/GoldCard';
import { TransferCard } from '@/components/TransferCard';
import { LiveIndicator } from '@/components/LiveIndicator';
import { useMultipleLivePrices } from '@/hooks/useLivePrice';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  const t = {
    search: language === 'ar' ? 'ابحث عن عملة، ذهب، منصة...' : 'Search currency, gold, platform...',
    categories: {
      all: language === 'ar' ? 'الكل' : 'All',
      currency: language === 'ar' ? 'العملات' : 'Currencies',
      crypto: language === 'ar' ? 'الرقمية' : 'Crypto',
      gold: language === 'ar' ? 'الذهب' : 'Gold',
      transfer: language === 'ar' ? 'التحويل' : 'Transfer',
    },
    popular: language === 'ar' ? 'الأكثر تداولاً' : 'Most Traded',
    noResults: language === 'ar' ? 'لا توجد نتائج' : 'No Results',
    loading: language === 'ar' ? 'جاري التحميل...' : 'Loading...',
    lastUpdate: language === 'ar' ? 'آخر تحديث' : 'Last Update',
  };

  // Fetch initial rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/DZD');
        const data = await response.json();
        setRates(data.rates);
        setLastUpdate(new Date());
      } catch (error) {
        // Fallback rates
        setRates({ EUR: 0.00665, USD: 0.00729, GBP: 0.00577, CAD: 0.01023, TRY: 0.21, AED: 0.0268 });
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  // Dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Calculate square rates
  const getSquareRate = (officialRate: number) => Math.round(officialRate * 1.85);
  const getSquareBuyRate = (officialRate: number) => Math.round(officialRate * 1.80);
  const getSquareSellRate = (officialRate: number) => Math.round(officialRate * 1.90);

  // Currency data with live prices
  const currencyBaseData = [
    { id: 'eur', code: 'EUR', name: language === 'ar' ? 'اليورو' : 'Euro', icon: '€' },
    { id: 'usd', code: 'USD', name: language === 'ar' ? 'الدولار' : 'US Dollar', icon: '$' },
    { id: 'gbp', code: 'GBP', name: language === 'ar' ? 'الجنيه' : 'Pound', icon: '£' },
    { id: 'cad', code: 'CAD', name: language === 'ar' ? 'الكندي' : 'Canadian', icon: 'C$' },
    { id: 'try', code: 'TRY', name: language === 'ar' ? 'الليرة التركية' : 'Turkish Lira', icon: '₺' },
    { id: 'aed', code: 'AED', name: language === 'ar' ? 'الدرهم الإماراتي' : 'UAE Dirham', icon: 'د.إ' },
  ];

  const currenciesWithRates = currencyBaseData.map(c => ({
    ...c,
    baseValue: rates[c.code] ? Math.round(1 / rates[c.code]) : 150,
  }));

  const livePrices = useMultipleLivePrices(currenciesWithRates);

  // Crypto data
  const cryptoData = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', priceUSD: 95000, priceDZD: 12500000, change24h: 2.5 },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', priceUSD: 3400, priceDZD: 450000, change24h: -1.2 },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: '₮', priceUSD: 1, priceDZD: 137, change24h: 0.01 },
    { id: 'bnb', name: 'Binance', symbol: 'BNB', icon: 'B', priceUSD: 650, priceDZD: 85000, change24h: 3.1 },
  ];

  // Gold data
  const goldData = [
    { id: 'gold24', name: language === 'ar' ? 'ذهب 24 قيراط' : 'Gold 24K', symbol: '24K', icon: '🥇', buyPrice: 15500, change24h: 0.8 },
    { id: 'gold21', name: language === 'ar' ? 'ذهب 21 قيراط' : 'Gold 21K', symbol: '21K', icon: '🥈', buyPrice: 13500, change24h: 0.5 },
    { id: 'gold18', name: language === 'ar' ? 'ذهب 18 قيراط' : 'Gold 18K', symbol: '18K', icon: '🥉', buyPrice: 11500, change24h: 0.3 },
  ];

  // Transfer data
  const transferData = [
    { id: 'paysera', name: 'Paysera', symbol: 'EUR', icon: '💳', buyPrice: 245, sellPrice: 250, fees: '0.5%', speed: language === 'ar' ? 'فوري' : 'Instant', rating: 4.8 },
    { id: 'wise', name: 'Wise', symbol: 'EUR', icon: '🌐', buyPrice: 243, sellPrice: 248, fees: '0.7%', speed: language === 'ar' ? '1-2 يوم' : '1-2 days', rating: 4.7 },
    { id: 'paypal', name: 'PayPal', symbol: 'USD', icon: '💰', buyPrice: 200, sellPrice: 205, fees: '2.5%', speed: language === 'ar' ? 'فوري' : 'Instant', rating: 4.5 },
  ];

  // Ticker items
  const tickerItems = currencyBaseData.map(c => ({
    symbol: c.code,
    name: c.name,
    price: livePrices[c.id]?.value || 150,
    change: (Math.random() - 0.5) * 4,
  }));

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleDownload = (item: any) => {
    toast({
      title: language === 'ar' ? 'جاري التحميل...' : 'Downloading...',
      description: `${item.name} - ${item.symbol}`,
    });
  };

  // Filter data
  const filterData = (data: any[], category: string) => {
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.symbol?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={48} />
          <p className="text-xl font-bold text-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header
        language={language}
        darkMode={darkMode}
        onToggleLanguage={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')}
        onToggleDarkMode={() => setDarkMode(d => !d)}
        onToggleCalculator={() => setShowCalculator(s => !s)}
      />

      {/* Live Ticker */}
      <PriceTicker items={tickerItems} />

      {/* Calculator */}
      <ConverterCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        rates={rates}
        language={language}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="bg-card rounded-2xl shadow-lg p-4 mb-6 border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full pr-10 pl-4 py-3 border-2 border-input rounded-xl focus:border-primary focus:outline-none bg-background text-foreground transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(t.categories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    selectedCategory === key
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <LiveIndicator />
            <span className="text-sm text-muted-foreground">
              {t.lastUpdate}: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <RefreshCw size={14} />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>

        {/* Currencies */}
        {(selectedCategory === 'all' || selectedCategory === 'currency') && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              💱 {t.categories.currency}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterData(currencyBaseData, 'currency').map(currency => {
                const priceData = livePrices[currency.id];
                const official = priceData?.value || 150;
                return (
                  <CurrencyCard
                    key={currency.id}
                    id={currency.id}
                    name={currency.name}
                    symbol={currency.code}
                    icon={currency.icon}
                    official={official}
                    squareBuy={getSquareBuyRate(official)}
                    squareSell={getSquareSellRate(official)}
                    change24h={(Math.random() - 0.5) * 4}
                    direction={priceData?.direction || 'stable'}
                    isFavorite={favorites.includes(currency.id)}
                    onToggleFavorite={() => toggleFavorite(currency.id)}
                    onDownload={() => handleDownload(currency)}
                    language={language}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Crypto */}
        {(selectedCategory === 'all' || selectedCategory === 'crypto') && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              ₿ {t.categories.crypto}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filterData(cryptoData, 'crypto').map(crypto => (
                <CryptoCard
                  key={crypto.id}
                  name={crypto.name}
                  symbol={crypto.symbol}
                  icon={crypto.icon}
                  priceUSD={crypto.priceUSD}
                  priceDZD={crypto.priceDZD}
                  change24h={crypto.change24h}
                  direction={crypto.change24h >= 0 ? 'up' : 'down'}
                  isFavorite={favorites.includes(crypto.id)}
                  onToggleFavorite={() => toggleFavorite(crypto.id)}
                  language={language}
                />
              ))}
            </div>
          </section>
        )}

        {/* Gold */}
        {(selectedCategory === 'all' || selectedCategory === 'gold') && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              🥇 {t.categories.gold}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterData(goldData, 'gold').map(gold => (
                <GoldCard
                  key={gold.id}
                  name={gold.name}
                  symbol={gold.symbol}
                  icon={gold.icon}
                  buyPrice={gold.buyPrice}
                  change24h={gold.change24h}
                  direction={gold.change24h >= 0 ? 'up' : 'down'}
                  isFavorite={favorites.includes(gold.id)}
                  onToggleFavorite={() => toggleFavorite(gold.id)}
                  onDownload={() => handleDownload(gold)}
                  language={language}
                />
              ))}
            </div>
          </section>
        )}

        {/* Transfer */}
        {(selectedCategory === 'all' || selectedCategory === 'transfer') && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              💳 {t.categories.transfer}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterData(transferData, 'transfer').map(transfer => (
                <TransferCard
                  key={transfer.id}
                  name={transfer.name}
                  symbol={transfer.symbol}
                  icon={transfer.icon}
                  buyPrice={transfer.buyPrice}
                  sellPrice={transfer.sellPrice}
                  fees={transfer.fees}
                  speed={transfer.speed}
                  rating={transfer.rating}
                  direction="stable"
                  isFavorite={favorites.includes(transfer.id)}
                  onToggleFavorite={() => toggleFavorite(transfer.id)}
                  language={language}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold text-lg">💱 E-Sekoir</p>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? 'منصة الصرف الشاملة - الجزائر' : 'Complete Exchange Platform - Algeria'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © 2024 E-Sekoir. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
