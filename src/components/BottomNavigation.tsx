import React, { memo, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const BottomNavigation: React.FC = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const channel = supabase
        .channel('nav-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          () => fetchUnreadCount()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
    
    setUnreadMessages(count || 0);
  };

  const getActiveItem = () => {
    switch (location.pathname) {
      case '/': return 'home';
      case '/shop': return 'shop';
      case '/messages': return 'messages';
      case '/account': 
      case '/admin':
        return 'account';
      default: return 'home';
    }
  };

  const activeItem = getActiveItem();

  const handleNavClick = (item: 'home' | 'shop' | 'messages' | 'account') => {
    const paths: Record<string, string> = {
      home: '/',
      shop: '/shop',
      messages: '/messages',
      account: '/account'
    };
    const targetPath = paths[item];
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
          {/* Account */}
          <button 
            onClick={() => handleNavClick('account')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activeItem === 'account' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            type="button"
          >
            <User size={22} />
            <span className="text-xs font-medium">{language === 'ar' ? 'الحساب' : 'Account'}</span>
          </button>

          {/* Messages */}
          <button 
            onClick={() => handleNavClick('messages')}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activeItem === 'messages' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            type="button"
          >
            <div className="relative">
              <MessageCircle size={22} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{language === 'ar' ? 'الرسائل' : 'Messages'}</span>
          </button>
          
          {/* Shop */}
          <button 
            onClick={() => handleNavClick('shop')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activeItem === 'shop' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            type="button"
          >
            <ShoppingCart size={22} />
            <span className="text-xs font-medium">{language === 'ar' ? 'السوق' : 'Shop'}</span>
          </button>
          
          {/* Home */}
          <button 
            onClick={() => handleNavClick('home')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
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
