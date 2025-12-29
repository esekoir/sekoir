import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface PriceTickerProps {
  items: TickerItem[];
}

export const PriceTicker: React.FC<PriceTickerProps> = ({ items }) => {
  // Duplicate items for seamless loop
  const tickerItems = [...items, ...items];

  return (
    <div className="ticker-wrap bg-secondary/90 backdrop-blur-sm py-2 border-y border-border/50">
      <div className="ticker">
        {tickerItems.map((item, index) => (
          <div 
            key={`${item.symbol}-${index}`}
            className="inline-flex items-center gap-4 px-6 border-l border-border/30"
          >
            <span className="font-bold text-primary-foreground">{item.symbol}</span>
            <span className="text-muted-foreground text-sm">{item.name}</span>
            <span className="font-bold text-primary-foreground">
              {item.price.toLocaleString()} DZD
            </span>
            <span 
              className={`flex items-center gap-1 text-sm font-semibold ${
                item.change >= 0 ? 'text-success' : 'text-destructive'
              }`}
            >
              {item.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
