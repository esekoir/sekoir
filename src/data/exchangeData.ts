// Currency Data
export const currencies = [
  { id: 'eur', name: 'يورو', symbol: 'EUR', officialRate: 145.50, squareBuy: 252.00, squareSell: 253.50, change24h: 0.85 },
  { id: 'usd', name: 'دولار أمريكي', symbol: 'USD', officialRate: 134.50, squareBuy: 228.00, squareSell: 229.50, change24h: -0.32 },
  { id: 'gbp', name: 'جنيه إسترليني', symbol: 'GBP', officialRate: 170.25, squareBuy: 285.00, squareSell: 287.00, change24h: 1.20 },
  { id: 'cad', name: 'دولار كندي', symbol: 'CAD', officialRate: 98.75, squareBuy: 165.00, squareSell: 166.50, change24h: 0.45 },
  { id: 'try', name: 'ليرة تركية', symbol: 'TRY', officialRate: 3.85, squareBuy: 6.50, squareSell: 6.80, change24h: -1.50 },
  { id: 'aed', name: 'درهم إماراتي', symbol: 'AED', officialRate: 36.50, squareBuy: 62.00, squareSell: 62.80, change24h: 0.15 },
];

// Crypto Data
export const cryptos = [
  { id: 'btc', name: 'بيتكوين', symbol: 'BTC', priceUSD: 43250.00, priceDZD: 9861000, change24h: 2.45 },
  { id: 'eth', name: 'إيثريوم', symbol: 'ETH', priceUSD: 2280.50, priceDZD: 519954, change24h: 1.85 },
  { id: 'usdt', name: 'تيثر', symbol: 'USDT', priceUSD: 1.00, priceDZD: 228, change24h: 0.01 },
  { id: 'bnb', name: 'بينانس', symbol: 'BNB', priceUSD: 315.75, priceDZD: 71991, change24h: -0.75 },
];

// Gold Data
export const golds = [
  { id: 'gold24', name: 'ذهب 24 قيراط', symbol: '24K', buyPrice: 18500, change24h: 0.95 },
  { id: 'gold21', name: 'ذهب 21 قيراط', symbol: '21K', buyPrice: 16200, change24h: 0.85 },
  { id: 'gold18', name: 'ذهب 18 قيراط', symbol: '18K', buyPrice: 13900, change24h: 0.75 },
];

// Transfer Services Data
export const transfers = [
  { id: 'paysera', name: 'Paysera', symbol: 'EUR', buyPrice: 250.00, sellPrice: 248.00, fees: '1.5%', speed: 'فوري', rating: 4.8 },
  { id: 'wise', name: 'Wise', symbol: 'EUR', buyPrice: 251.50, sellPrice: 249.50, fees: '0.5%', speed: '1-2 أيام', rating: 4.9 },
  { id: 'paypal', name: 'PayPal', symbol: 'USD', buyPrice: 235.00, sellPrice: 232.00, fees: '3.5%', speed: 'فوري', rating: 4.5 },
  { id: 'skrill', name: 'Skrill', symbol: 'EUR', buyPrice: 248.00, sellPrice: 245.00, fees: '2.0%', speed: 'فوري', rating: 4.3 },
];

export type Currency = typeof currencies[0];
export type Crypto = typeof cryptos[0];
export type Gold = typeof golds[0];
export type Transfer = typeof transfers[0];
