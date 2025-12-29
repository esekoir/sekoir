import React from 'react';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { CurrencyCard } from '@/components/CurrencyCard';
import { CryptoCard } from '@/components/CryptoCard';
import { GoldCard } from '@/components/GoldCard';
import { TransferCard } from '@/components/TransferCard';
import { getCurrencyIcon } from '@/components/icons/CurrencyIcons';
import type { CategoryType } from '@/hooks/useExchangeState';
import type { Language } from '@/data/translations';
import type { Currency, Crypto, Gold, Transfer } from '@/data/exchangeData';

interface ItemCardProps {
  item: Currency | Crypto | Gold | Transfer;
  category: CategoryType;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  category,
  language,
  isFavorite,
  onToggleFavorite,
}) => {
  const downloadAsImage = async (id: string) => {
    const element = document.getElementById(`card-${id}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `${id}-rate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const icon = getCurrencyIcon(item.id, "w-12 h-12");
  const direction = (item as any).change24h >= 0 ? 'up' : 'down';

  const renderCard = () => {
    switch (category) {
      case 'currencies':
        const currency = item as Currency;
        return (
          <CurrencyCard
            id={currency.id}
            name={currency.name}
            symbol={currency.symbol}
            icon={icon}
            official={currency.officialRate}
            squareBuy={currency.squareBuy}
            squareSell={currency.squareSell}
            change24h={currency.change24h}
            direction={direction}
            isFavorite={isFavorite}
            onToggleFavorite={() => onToggleFavorite(item.id)}
            onDownload={() => downloadAsImage(item.id)}
            language={language}
          />
        );
      
      case 'crypto':
        const crypto = item as Crypto;
        return (
          <CryptoCard
            name={crypto.name}
            symbol={crypto.symbol}
            icon={icon}
            priceUSD={crypto.priceUSD}
            priceDZD={crypto.priceDZD}
            change24h={crypto.change24h}
            direction={direction}
            isFavorite={isFavorite}
            onToggleFavorite={() => onToggleFavorite(item.id)}
            language={language}
          />
        );
      
      case 'gold':
        const gold = item as Gold;
        return (
          <GoldCard
            name={gold.name}
            symbol={gold.symbol}
            icon={icon}
            buyPrice={gold.buyPrice}
            change24h={gold.change24h}
            direction={direction}
            isFavorite={isFavorite}
            onToggleFavorite={() => onToggleFavorite(item.id)}
            onDownload={() => downloadAsImage(item.id)}
            language={language}
          />
        );
      
      case 'transfers':
        const transfer = item as Transfer;
        return (
          <TransferCard
            name={transfer.name}
            symbol={transfer.symbol}
            icon={icon}
            buyPrice={transfer.buyPrice}
            sellPrice={transfer.sellPrice}
            fees={transfer.fees}
            speed={transfer.speed}
            rating={transfer.rating}
            direction={direction}
            isFavorite={isFavorite}
            onToggleFavorite={() => onToggleFavorite(item.id)}
            language={language}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div id={`card-${item.id}`} className="relative group">
      {renderCard()}
      <button
        onClick={() => downloadAsImage(item.id)}
        className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-emerald-500 hover:text-white"
        title="تحميل كصورة"
      >
        <Download size={16} />
      </button>
    </div>
  );
};

export default ItemCard;
