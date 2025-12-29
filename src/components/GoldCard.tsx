import React from 'react';
import { TrendingUp, TrendingDown, Heart, Download } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { LiveDot } from './LiveIndicator';

interface GoldCardProps {
  name: string;
  symbol: string;
  icon: React.ReactNode;
  buyPrice: number;
  change24h: number;
  direction: 'up' | 'down' | 'stable';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDownload: () => void;
  language: 'ar' | 'en';
}

export const GoldCard: React.FC<GoldCardProps> = ({
  name,
  symbol,
  icon,
  buyPrice,
  change24h,
  direction,
  isFavorite,
  onToggleFavorite,
  onDownload,
  language,
}) => {
  const t = {
    buy: language === 'ar' ? 'سعر الشراء' : 'Buy Price',
    perGram: language === 'ar' ? 'للجرام' : 'per gram',
    change: language === 'ar' ? 'التغير 24س' : '24h Change',
    download: language === 'ar' ? 'تحميل' : 'Download',
  };

  return (
    <div className="glow-card bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-amber-200 dark:border-amber-700 relative group overflow-hidden">
      {/* Live indicator */}
      <div className="absolute top-3 left-3">
        <LiveDot size="sm" />
      </div>
      
      {/* Actions */}
      <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onToggleFavorite}
          className="bg-card/80 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
        >
          <Heart 
            size={16} 
            className={isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"} 
          />
        </button>
        <button 
          onClick={onDownload}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Download size={14} />
          {t.download}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white text-xl shadow-lg animate-float">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-card-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">{symbol}</p>
        </div>
      </div>

      {/* Price */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-800/30 dark:to-yellow-800/30 mb-3">
        <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold mb-1">{t.buy}</div>
        <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
          <AnimatedNumber 
            value={buyPrice} 
            direction={direction}
            suffix=" DZD"
          />
        </div>
        <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t.perGram}</div>
      </div>

      {/* Change */}
      <div className="flex justify-between items-center pt-3 border-t border-amber-200 dark:border-amber-700">
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
