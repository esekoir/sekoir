import React, { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const BottomNavigation: React.FC = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const getActiveItem = () => {
    switch (location.pathname) {
      case '/': return 'home';
      case '/shop': return 'shop';
      case '/account': 
      case '/admin':
        return 'account';
      default: return 'home';
    }
  };

  const activeItem = getActiveItem();

  const handleNavClick = (item: 'home' | 'shop' | 'account') => {
    const targetPath = item === 'home' ? '/' : item === 'shop' ? '/shop' : '/account';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
        willChange: 'auto'
      }}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {/* Account - First from right */}
          <button 
            onClick={() => handleNavClick('account')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeItem === 'account' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            type="button"
          >
            <User size={22} />
            <span className="text-xs font-medium">{language === 'ar' ? 'الحساب' : 'Account'}</span>
          </button>
          
          {/* Shop - Middle */}
          <button 
            onClick={() => handleNavClick('shop')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeItem === 'shop' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            type="button"
          >
            <ShoppingCart size={22} />
            <span className="text-xs font-medium">{language === 'ar' ? 'تسوق' : 'Shop'}</span>
          </button>
          
          {/* Home - Last from right */}
          <button 
            onClick={() => handleNavClick('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeItem === 'home' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            type="button"
          >
            <Home size={22} />
            <span className="text-xs font-medium">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;
