import React from 'react';
import { Star, Heart } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { LiveDot } from './LiveIndicator';

interface TransferCardProps {
  name: string;
  symbol: string;
  icon: React.ReactNode;
  buyPrice: number;
  sellPrice: number;
  fees: string;
  speed: string;
  rating: number;
  direction: 'up' | 'down' | 'stable';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  language: 'ar' | 'en';
}

export const TransferCard: React.FC<TransferCardProps> = ({
  name,
  symbol,
  icon,
  buyPrice,
  sellPrice,
  fees,
  speed,
  rating,
  direction,
  isFavorite,
  onToggleFavorite,
  language,
}) => {
  const t = {
    buy: language === 'ar' ? 'شراء' : 'Buy',
    sell: language === 'ar' ? 'بيع' : 'Sell',
    fees: language === 'ar' ? 'الرسوم' : 'Fees',
    speed: language === 'ar' ? 'السرعة' : 'Speed',
    rating: language === 'ar' ? 'التقييم' : 'Rating',
  };

  return (
    <div className="glow-card bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-indigo-200 dark:border-indigo-700 relative group overflow-hidden">
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
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xl shadow-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-card-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">{symbol}</p>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-success/10">
          <div className="text-xs text-success font-semibold">{t.buy}</div>
          <div className="text-lg font-bold text-success">
            <AnimatedNumber value={buyPrice} direction={direction} />
          </div>
        </div>
        <div className="p-2 rounded-lg bg-destructive/10">
          <div className="text-xs text-destructive font-semibold">{t.sell}</div>
          <div className="text-lg font-bold text-destructive">
            <AnimatedNumber value={sellPrice} direction={direction} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t.fees}</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{fees}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t.speed}</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">{speed}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t.rating}</span>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="font-bold">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
