import React, { memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User } from 'lucide-react';

interface BottomNavigationProps {
  language?: 'ar' | 'en';
}

export const BottomNavigation: React.FC<BottomNavigationProps> = memo(({ language = 'ar' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveItem = useCallback(() => {
    switch (location.pathname) {
      case '/': return 'home';
      case '/shop': return 'shop';
      case '/account': 
      case '/admin':
        return 'account';
      default: return 'home';
    }
  }, [location.pathname]);

  const activeItem = getActiveItem();

  const handleNavClick = useCallback((item: 'home' | 'shop' | 'account', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent navigation if already on the page
    const currentPath = location.pathname;
    const targetPath = item === 'home' ? '/' : item === 'shop' ? '/shop' : '/account';
    
    if (currentPath === targetPath) return;
    
    // Use replace for smoother transitions
    navigate(targetPath);
  }, [navigate, location.pathname]);

  return (
    <nav 
      className="bottom-nav"
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        willChange: 'transform'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          {/* Account - First from right */}
          <button 
            onClick={(e) => handleNavClick('account', e)}
            className={`bottom-nav-item ${activeItem === 'account' ? 'active' : ''}`}
            type="button"
          >
            <User size={22} />
            <span>{language === 'ar' ? 'الحساب' : 'Account'}</span>
          </button>
          
          {/* Shop - Middle */}
          <button 
            onClick={(e) => handleNavClick('shop', e)}
            className={`bottom-nav-item ${activeItem === 'shop' ? 'active' : ''}`}
            type="button"
          >
            <ShoppingCart size={22} />
            <span>{language === 'ar' ? 'تسوق' : 'Shop'}</span>
          </button>
          
          {/* Home - Last from right */}
          <button 
            onClick={(e) => handleNavClick('home', e)}
            className={`bottom-nav-item ${activeItem === 'home' ? 'active' : ''}`}
            type="button"
          >
            <Home size={22} />
            <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;
