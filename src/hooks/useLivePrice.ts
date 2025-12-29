import { useState, useEffect, useCallback } from 'react';

interface PriceData {
  value: number;
  previousValue: number;
  direction: 'up' | 'down' | 'stable';
  lastUpdate: Date;
}

export const useLivePrice = (baseValue: number, volatility: number = 0.005) => {
  const [priceData, setPriceData] = useState<PriceData>({
    value: baseValue,
    previousValue: baseValue,
    direction: 'stable',
    lastUpdate: new Date(),
  });

  const updatePrice = useCallback(() => {
    setPriceData(prev => {
      // Random price fluctuation
      const change = (Math.random() - 0.5) * 2 * volatility * prev.value;
      const newValue = Math.max(prev.value + change, prev.value * 0.95);
      const roundedValue = Math.round(newValue * 100) / 100;
      
      return {
        value: roundedValue,
        previousValue: prev.value,
        direction: roundedValue > prev.value ? 'up' : roundedValue < prev.value ? 'down' : 'stable',
        lastUpdate: new Date(),
      };
    });
  }, [volatility]);

  useEffect(() => {
    // Update every 2-5 seconds randomly for realistic feel
    const getRandomInterval = () => 2000 + Math.random() * 3000;
    
    let timeoutId: NodeJS.Timeout;
    
    const scheduleUpdate = () => {
      timeoutId = setTimeout(() => {
        updatePrice();
        scheduleUpdate();
      }, getRandomInterval());
    };
    
    scheduleUpdate();
    
    return () => clearTimeout(timeoutId);
  }, [updatePrice]);

  return priceData;
};

export const useMultipleLivePrices = (currencies: { id: string; baseValue: number }[]) => {
  const [prices, setPrices] = useState<Record<string, PriceData>>(() => {
    const initial: Record<string, PriceData> = {};
    currencies.forEach(c => {
      initial[c.id] = {
        value: c.baseValue,
        previousValue: c.baseValue,
        direction: 'stable',
        lastUpdate: new Date(),
      };
    });
    return initial;
  });

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    currencies.forEach(currency => {
      const updateCurrency = () => {
        setPrices(prev => {
          const current = prev[currency.id];
          const volatility = 0.003; // 0.3% max change
          const change = (Math.random() - 0.5) * 2 * volatility * current.value;
          const newValue = Math.round(current.value + change);
          
          return {
            ...prev,
            [currency.id]: {
              value: newValue,
              previousValue: current.value,
              direction: newValue > current.value ? 'up' : newValue < current.value ? 'down' : 'stable',
              lastUpdate: new Date(),
            },
          };
        });
      };
      
      // Random interval for each currency
      const interval = setInterval(updateCurrency, 1500 + Math.random() * 2000);
      intervals.push(interval);
    });
    
    return () => intervals.forEach(clearInterval);
  }, []);

  return prices;
};
