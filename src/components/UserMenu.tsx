import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User } from 'lucide-react';

interface UserMenuProps {
  language: 'ar' | 'en';
}

const UserMenu: React.FC<UserMenuProps> = ({ language }) => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, signOut } = useAuth();

  const t = {
    login: language === 'ar' ? 'تسجيل الدخول' : 'Login',
    logout: language === 'ar' ? 'خروج' : 'Logout'
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => navigate('/auth')}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">{t.login}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-8 h-8 rounded-full object-cover border-2 border-primary"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        )}
        <span className="text-sm font-medium text-foreground hidden sm:inline">
          {profile?.full_name || user?.email?.split('@')[0]}
        </span>
      </div>
      <button
        onClick={signOut}
        className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-2 rounded-lg font-medium transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">{t.logout}</span>
      </button>
    </div>
  );
};

export default UserMenu;
