import React from 'react';
import { Wifi, CreditCard } from 'lucide-react';
import type { Language } from '@/data/translations';
import { translations } from '@/data/translations';

interface BankCardProps {
  language: Language;
}

const BankCard: React.FC<BankCardProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="mb-8">
      <div className="card-3d-container mx-auto" style={{ maxWidth: '400px' }}>
        <div className="card-3d">
          {/* Front */}
          <div className="card-3d-front bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div className="text-xl font-bold">E-Sekoir</div>
              <Wifi size={24} className="rotate-90" />
            </div>
            
            <div className="card-chip mb-6"></div>
            
            <div className="text-lg tracking-widest mb-4 font-mono">
              •••• •••• •••• 4532
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs opacity-70">{t.cardNumber}</div>
                <div className="font-medium">EXCHANGE CARD</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70">{t.validThru}</div>
                <div className="font-medium">12/28</div>
              </div>
            </div>
          </div>
          
          {/* Back */}
          <div className="card-3d-back bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-2xl">
            <div className="bg-gray-700 h-12 -mx-6 mt-4 mb-6"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-200 h-10 flex-1 rounded flex items-center justify-end px-4 text-gray-800 font-mono">
                •••
              </div>
            </div>
            <div className="flex justify-between items-center mt-8">
              <CreditCard size={32} className="opacity-50" />
              <div className="text-xs opacity-70">منصة الصرف الآمنة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankCard;
