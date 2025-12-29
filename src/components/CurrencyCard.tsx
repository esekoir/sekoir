import React from 'react';
import { TrendingUp, TrendingDown, Heart, Download } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { LiveDot } from './LiveIndicator';

interface CurrencyCardProps {
  id: string;
  name: string;
  symbol: string;
  icon: React.ReactNode;
  official: number;
  squareBuy: number;
  squareSell: number;
  change24h: number;
  direction: 'up' | 'down' | 'stable';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDownload: () => void;
  language: 'ar' | 'en';
}

export const CurrencyCard: React.FC<CurrencyCardProps> = ({
  name,
  symbol,
  icon,
  official,
  squareBuy,
  squareSell,
  change24h,
  direction,
  isFavorite,
  onToggleFavorite,
  onDownload,
  language,
}) => {
  const t = {
    official: language === 'ar' ? 'البنك الرسمي' : 'Official Bank',
    squareBuy: language === 'ar' ? 'شراء السكوار' : 'Square Buy',
    squareSell: language === 'ar' ? 'بيع السكوار' : 'Square Sell',
    change: language === 'ar' ? 'التغير 24س' : '24h Change',
    download: language === 'ar' ? 'تحميل' : 'Download',
  };

  return (
    <div className="glow-card breathing-glow bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-border relative group overflow-hidden">
      {/* Shimmer effect */}
      <div className="shimmer absolute inset-0 pointer-events-none" />
      
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Download size={14} />
          {t.download}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xl shadow-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-card-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">{symbol}</p>
        </div>
      </div>

      {/* Official Rate */}
      <div className="mb-3 p-3 rounded-lg bg-muted/50">
        <div className="text-xs text-muted-foreground font-semibold mb-1">{t.official}</div>
        <div className="text-2xl font-bold text-card-foreground">
          <AnimatedNumber 
            value={official} 
            direction={direction}
            suffix=" DZD"
          />
        </div>
      </div>

      {/* Square Rates */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="text-xs text-success font-semibold mb-1">{t.squareBuy}</div>
          <div className="text-lg font-bold text-success">
            <AnimatedNumber 
              value={squareBuy} 
              direction={direction}
            />
          </div>
        </div>
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="text-xs text-destructive font-semibold mb-1">{t.squareSell}</div>
          <div className="text-lg font-bold text-destructive">
            <AnimatedNumber 
              value={squareSell} 
              direction={direction}
            />
          </div>
        </div>
      </div>

      {/* Change */}
      <div className="flex justify-between items-center pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">{t.change}</span>
        <span 
          className={`flex items-center gap-1 text-sm font-bold ${
            change24h >= 0 ? 'text-success' : 'text-destructive'
          }`}
        >
          {change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <AnimatedNumber 
            value={Math.abs(change24h)} 
            decimals={2}
            prefix={change24h >= 0 ? '+' : '-'}
            suffix="%"
          />
        </span>
      </div>
    </div>
  );
};
