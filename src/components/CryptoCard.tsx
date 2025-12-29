import React from 'react';
import { TrendingUp, TrendingDown, Heart } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { LiveDot } from './LiveIndicator';

interface CryptoCardProps {
  name: string;
  symbol: string;
  icon: React.ReactNode;
  priceUSD: number;
  priceDZD: number;
  change24h: number;
  direction: 'up' | 'down' | 'stable';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  language: 'ar' | 'en';
}

export const CryptoCard: React.FC<CryptoCardProps> = ({
  name,
  symbol,
  icon,
  priceUSD,
  priceDZD,
  change24h,
  direction,
  isFavorite,
  onToggleFavorite,
  language,
}) => {
  const t = {
    priceUSD: language === 'ar' ? 'السعر بالدولار' : 'Price in USD',
    priceDZD: language === 'ar' ? 'السعر بالدينار' : 'Price in DZD',
    change: language === 'ar' ? 'التغير 24س' : '24h Change',
  };

  return (
    <div className="glow-card bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-purple-200 dark:border-purple-800 relative group overflow-hidden">
      {/* Live indicator */}
      <div className="absolute top-3 left-3">
        <LiveDot size="sm" />
      </div>
      
      {/* Favorite button */}
      <button 
        onClick={onToggleFavorite}
        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Heart 
          size={18} 
          className={isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"} 
        />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl shadow-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-card-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">{symbol}</p>
        </div>
      </div>

      {/* Prices */}
      <div className="space-y-2 mb-3">
        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{t.priceDZD}</div>
          <div className="text-xl font-bold text-purple-800 dark:text-purple-200">
            <AnimatedNumber 
              value={priceDZD} 
              direction={direction}
              suffix=" DZD"
            />
          </div>
        </div>
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{t.priceUSD}</div>
          <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
            <AnimatedNumber 
              value={priceUSD} 
              direction={direction}
              prefix="$"
            />
          </div>
        </div>
      </div>

      {/* Change */}
      <div className="flex justify-between items-center pt-3 border-t border-purple-200 dark:border-purple-700">
        <span className="text-xs text-muted-foreground">{t.change}</span>
        <span 
          className={`flex items-center gap-1 text-sm font-bold ${
            change24h >= 0 ? 'text-success' : 'text-destructive'
          }`}
        >
          {change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change24h).toFixed(2)}%
        </span>
      </div>
    </div>
  );
};
