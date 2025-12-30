import { useState, useEffect } from 'react';
import { useAuthPHP } from './useAuthPHP';

export const useAdminPHP = () => {
  const { user, loading: authLoading } = useAuthPHP();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    setIsAdmin(user?.role === 'admin');
    setLoading(false);
  }, [user, authLoading]);

  return { isAdmin, loading };
};
