import React from 'react';

// Euro Icon
export const EuroIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#003399"/>
    <path d="M7 11h6M7 13h6M15 8c-1.5-1.5-3.5-2-5.5-1.5s-3.5 2-4 4 0 4 1.5 5.5 3.5 2 5.5 1.5" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// US Dollar Icon
export const USDIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#1a472a"/>
    <path d="M12 6v12M9 8.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5S14.33 10 13.5 10H10c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h4c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3c-.83 0-1.5-.67-1.5-1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// British Pound Icon
export const GBPIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#012169"/>
    <path d="M8 17h8M8 12h5M10 7c1-1.5 3-1.5 4 0s0 3-1 4-2 2-2 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Canadian Dollar Icon
export const CADIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#FF0000"/>
    <path d="M12 6l1.5 3.5 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L7 10l3.5-.5z" fill="white"/>
  </svg>
);

// Turkish Lira Icon
export const TRYIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#E30A17"/>
    <path d="M10 6v12M8 9l6-1M8 12l6-1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// UAE Dirham Icon
export const AEDIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#00732F"/>
    <path d="M8 8h8v2a4 4 0 01-8 0V8zM8 14h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Bitcoin Icon
export const BTCIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#F7931A"/>
    <path d="M10 6v1M14 6v1M10 17v1M14 17v1M9 7h5c1.1 0 2 .9 2 2s-.9 2-2 2H9V7zM9 11h6c1.1 0 2 .9 2 2s-.9 2-2 2H9v-4z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Ethereum Icon
export const ETHIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#627EEA"/>
    <path d="M12 4l5 8-5 3-5-3 5-8zM12 20l5-7-5 3-5-3 5 7z" fill="white" fillOpacity="0.9"/>
    <path d="M12 11l5 1-5 3-5-3 5-1z" fill="white" fillOpacity="0.6"/>
  </svg>
);

// USDT Icon
export const USDTIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#26A17B"/>
    <path d="M8 8h8M12 8v10M9 11c0 1.5 1.5 2 3 2s3-.5 3-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// BNB Icon
export const BNBIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#F3BA2F"/>
    <path d="M12 6l2 2-2 2-2-2 2-2zM6 12l2 2-2 2-2-2 2-2zM18 12l2 2-2 2-2-2 2-2zM12 14l2 2-2 2-2-2 2-2z" fill="white"/>
  </svg>
);

// Gold 24K Icon
export const Gold24Icon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="url(#gold24)"/>
    <defs>
      <linearGradient id="gold24" x1="2" y1="2" x2="22" y2="22">
        <stop stopColor="#FFD700"/>
        <stop offset="0.5" stopColor="#FFA500"/>
        <stop offset="1" stopColor="#B8860B"/>
      </linearGradient>
    </defs>
    <path d="M7 16l2-6 3 4 3-4 2 6H7z" fill="white" fillOpacity="0.9"/>
    <path d="M10 8a2 2 0 104 0 2 2 0 00-4 0z" fill="white" fillOpacity="0.9"/>
  </svg>
);

// Gold 21K Icon
export const Gold21Icon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="url(#gold21)"/>
    <defs>
      <linearGradient id="gold21" x1="2" y1="2" x2="22" y2="22">
        <stop stopColor="#DAA520"/>
        <stop offset="0.5" stopColor="#CD853F"/>
        <stop offset="1" stopColor="#8B4513"/>
      </linearGradient>
    </defs>
    <path d="M7 16l2-6 3 4 3-4 2 6H7z" fill="white" fillOpacity="0.9"/>
    <path d="M10 8a2 2 0 104 0 2 2 0 00-4 0z" fill="white" fillOpacity="0.9"/>
  </svg>
);

// Gold 18K Icon
export const Gold18Icon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="url(#gold18)"/>
    <defs>
      <linearGradient id="gold18" x1="2" y1="2" x2="22" y2="22">
        <stop stopColor="#C0C0C0"/>
        <stop offset="0.5" stopColor="#DAA520"/>
        <stop offset="1" stopColor="#8B4513"/>
      </linearGradient>
    </defs>
    <path d="M7 16l2-6 3 4 3-4 2 6H7z" fill="white" fillOpacity="0.9"/>
    <path d="M10 8a2 2 0 104 0 2 2 0 00-4 0z" fill="white" fillOpacity="0.9"/>
  </svg>
);

// Paysera Icon
export const PayseraIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#1A1F71"/>
    <path d="M8 8h4a2 2 0 010 4H8V8zM8 12h3M8 12v4" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Wise Icon
export const WiseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#9FE870"/>
    <path d="M6 12l3 3 7-7" stroke="#163300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// PayPal Icon
export const PayPalIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#003087"/>
    <path d="M9 7h3c2 0 3 1 3 3s-1 3-3 3h-2l-.5 3H7l2-9z" fill="#009CDE"/>
    <path d="M11 9h2c1 0 2 .5 2 2s-.5 2-1.5 2H12l-.5 2H9l2-6z" fill="white"/>
  </svg>
);

// Skrill Icon
export const SkrillIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#862165"/>
    <path d="M9 9c0-1 1-2 3-2s3 1 3 2-1 1.5-2 2-2 1-2 2 1 2 3 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Currency icon mapping
export const getCurrencyIcon = (id: string, className?: string) => {
  const icons: Record<string, React.ReactNode> = {
    eur: <EuroIcon className={className} />,
    usd: <USDIcon className={className} />,
    gbp: <GBPIcon className={className} />,
    cad: <CADIcon className={className} />,
    try: <TRYIcon className={className} />,
    aed: <AEDIcon className={className} />,
    btc: <BTCIcon className={className} />,
    eth: <ETHIcon className={className} />,
    usdt: <USDTIcon className={className} />,
    bnb: <BNBIcon className={className} />,
    gold24: <Gold24Icon className={className} />,
    gold21: <Gold21Icon className={className} />,
    gold18: <Gold18Icon className={className} />,
    paysera: <PayseraIcon className={className} />,
    wise: <WiseIcon className={className} />,
    paypal: <PayPalIcon className={className} />,
    skrill: <SkrillIcon className={className} />,
  };
  return icons[id] || null;
};
