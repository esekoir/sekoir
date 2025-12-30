import { useState, useEffect, useCallback } from 'react';
import { authApi, profilesApi, User, Profile } from '@/lib/api';

export const useAuthPHP = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!authApi.isAuthenticated()) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.getMe();
      setUser(data.user);
      
      if (data.user?.id) {
        const profileData = await profilesApi.getProfile(data.user.id);
        setProfile(profileData.profile || null);
      }
    } catch (error) {
      console.error('Auth error:', error);
      authApi.logout();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    await fetchUser();
    return result;
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name: string;
    username: string;
    wilaya: string;
  }) => {
    const result = await authApi.register(data);
    await fetchUser();
    return result;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: {
    full_name?: string;
    username?: string;
    wilaya?: string;
    avatar_url?: string;
  }) => {
    const result = await profilesApi.updateProfile(data);
    if (user?.id) {
      const profileData = await profilesApi.getProfile(user.id);
      setProfile(profileData.profile || null);
    }
    return result;
  };

  return {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    refetch: fetchUser,
  };
};
