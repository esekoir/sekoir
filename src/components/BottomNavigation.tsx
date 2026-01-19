import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User } from 'lucide-react';

interface BottomNavigationProps {
  language?: 'ar' | 'en';
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ language = 'ar' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveItem = () => {
    switch (location.pathname) {
      case '/': return 'home';
      case '/shop': return 'shop';
      case '/account': return 'account';
      default: return 'home';
    }
  };

  const activeItem = getActiveItem();

  const handleNavClick = (item: 'home' | 'shop' | 'account') => {
    switch (item) {
      case 'home':
        navigate('/');
        break;
      case 'shop':
        navigate('/shop');
        break;
      case 'account':
        navigate('/account');
        break;
    }
  };

  return (
    <nav className="bottom-nav">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => handleNavClick('home')}
            className={`bottom-nav-item ${activeItem === 'home' ? 'active' : ''}`}
          >
            <Home size={22} />
            <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>
          <button 
            onClick={() => handleNavClick('shop')}
            className={`bottom-nav-item ${activeItem === 'shop' ? 'active' : ''}`}
          >
            <ShoppingCart size={22} />
            <span>{language === 'ar' ? 'تسوق' : 'Shop'}</span>
          </button>
          <button 
            onClick={() => handleNavClick('account')}
            className={`bottom-nav-item ${activeItem === 'account' ? 'active' : ''}`}
          >
            <User size={22} />
            <span>{language === 'ar' ? 'الحساب' : 'Account'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
