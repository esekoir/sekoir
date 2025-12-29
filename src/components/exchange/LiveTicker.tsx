import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { currencies, cryptos } from '@/data/exchangeData';

const LiveTicker: React.FC = () => {
  const tickerItems = [
    ...currencies.map(c => ({ symbol: c.symbol, price: c.squareBuy, change: c.change24h })),
    ...cryptos.map(c => ({ symbol: c.symbol, price: c.priceUSD, change: c.change24h })),
  ];

  return (
    <div className="bg-gray-900 text-white py-2 overflow-hidden">
      <div className="ticker-wrap">
        <div className="ticker flex gap-8">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-bold">{item.symbol}</span>
              <span>{item.price.toLocaleString()}</span>
              <span className={`flex items-center text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(item.change)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
