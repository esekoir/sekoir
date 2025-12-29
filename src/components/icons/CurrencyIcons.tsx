import React from 'react';

// Icon mapping using icons8 images from public folder
const iconMap: Record<string, string> = {
  // Currencies
  eur: '/icons/eur.png',
  usd: '/icons/usd.png',
  gbp: '/icons/gbp.png',
  cad: '/icons/cad.png',
  try: '/icons/try.png',
  aed: '/icons/aed.png',
  
  // Crypto
  btc: '/icons/btc.png',
  eth: '/icons/eth.png',
  usdt: '/icons/usdt.png',
  bnb: '/icons/bnb.png',
  
  // Gold
  gold24: '/icons/gold24.png',
  gold21: '/icons/gold21.png',
  gold18: '/icons/gold18.png',
  
  // Transfer services
  paysera: '/icons/paysera.png',
  wise: '/icons/wise.png',
  paypal: '/icons/paypal.png',
  skrill: '/icons/skrill.png',
};

export const getCurrencyIcon = (id: string, className: string = "w-12 h-12") => {
  const iconPath = iconMap[id.toLowerCase()];
  
  if (iconPath) {
    return (
      <img 
        src={iconPath} 
        alt={id.toUpperCase()} 
        className={`${className} object-contain`}
      />
    );
  }
  
  // Fallback for unknown icons
  return (
    <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm`}>
      {id.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default getCurrencyIcon;
