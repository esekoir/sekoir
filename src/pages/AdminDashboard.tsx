import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Users, MessageSquare, Coins, Settings, Shield, Home,
  Trash2, Edit, Plus, CheckCircle, XCircle, Search,
  Moon, Sun, Globe, ArrowLeft, Save, X, Wallet, RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Currency {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  type: string;
  buy_price: number | null;
  sell_price: number | null;
  is_active: boolean;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  wilaya: string | null;
  member_number: number;
  is_verified: boolean;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  currency_code: string;
  user_id: string | null;
  guest_name: string | null;
  is_guest: boolean;
  created_at: string;
}

interface WalletWithProfile {
  id: string;
  user_id: string;
  balance: number;
  profiles: Profile;
}

interface SiteSetting {
  id: string;
  key: string;
  value: any;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'currencies' | 'users' | 'comments' | 'wallets' | 'settings'>('currencies');
  
  // Data states
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [wallets, setWallets] = useState<WalletWithProfile[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [currencyForm, setCurrencyForm] = useState({
    code: '', name_ar: '', name_en: '', type: 'currency', buy_price: '', sell_price: ''
  });

  const translations = {
    ar: {
      title: 'لوحة التحكم',
      currencies: 'العملات',
      users: 'المستخدمين',
      comments: 'التعليقات',
      wallets: 'المحافظ',
      settings: 'الإعدادات',
      search: 'بحث...',
      addCurrency: 'إضافة عملة',
      editCurrency: 'تعديل عملة',
      code: 'الرمز',
      nameAr: 'الاسم بالعربية',
      nameEn: 'الاسم بالإنجليزية',
      type: 'النوع',
      buyPrice: 'سعر الشراء',
      sellPrice: 'سعر البيع',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      verify: 'توثيق',
      unverify: 'إلغاء التوثيق',
      balance: 'الرصيد',
      memberNumber: 'رقم العضوية',
      noData: 'لا توجد بيانات',
      confirmDelete: 'هل أنت متأكد؟',
      backToHome: 'العودة للرئيسية',
      siteName: 'اسم الموقع',
      siteDescription: 'وصف الموقع',
      googleClientId: 'Google Client ID',
      googleClientSecret: 'Google Client Secret',
      googleEnabled: 'تفعيل Google',
      emailNotifications: 'إشعارات البريد',
      pushNotifications: 'إشعارات Push',
      saveSettings: 'حفظ الإعدادات',
      unauthorized: 'غير مصرح لك بالوصول'
    },
    en: {
      title: 'Admin Dashboard',
      currencies: 'Currencies',
      users: 'Users',
      comments: 'Comments',
      wallets: 'Wallets',
      settings: 'Settings',
      search: 'Search...',
      addCurrency: 'Add Currency',
      editCurrency: 'Edit Currency',
      code: 'Code',
      nameAr: 'Arabic Name',
      nameEn: 'English Name',
      type: 'Type',
      buyPrice: 'Buy Price',
      sellPrice: 'Sell Price',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      verify: 'Verify',
      unverify: 'Unverify',
      balance: 'Balance',
      memberNumber: 'Member #',
      noData: 'No data',
      confirmDelete: 'Are you sure?',
      backToHome: 'Back to Home',
      siteName: 'Site Name',
      siteDescription: 'Site Description',
      googleClientId: 'Google Client ID',
      googleClientSecret: 'Google Client Secret',
      googleEnabled: 'Enable Google',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      saveSettings: 'Save Settings',
      unauthorized: 'Unauthorized access'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
      setCheckingAdmin(false);
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && !checkingAdmin) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        toast({ title: t.unauthorized, variant: 'destructive' });
        navigate('/');
      } else {
        fetchAllData();
      }
    }
  }, [user, isAdmin, authLoading, checkingAdmin]);

  const fetchAllData = async () => {
    const [currRes, profRes, commRes, walRes, settRes] = await Promise.all([
      supabase.from('currencies').select('*').order('display_order'),
      supabase.from('profiles').select('*').order('member_number'),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
      supabase.from('wallets').select('*, profiles(*)'),
      supabase.from('site_settings').select('*')
    ]);

    if (currRes.data) setCurrencies(currRes.data);
    if (profRes.data) setProfiles(profRes.data);
    if (commRes.data) setComments(commRes.data);
    if (walRes.data) setWallets(walRes.data as any);
    if (settRes.data) setSettings(settRes.data);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveCurrency = async () => {
    try {
      const data = {
        code: currencyForm.code.toUpperCase(),
        name_ar: currencyForm.name_ar,
        name_en: currencyForm.name_en,
        type: currencyForm.type,
        buy_price: currencyForm.buy_price ? parseFloat(currencyForm.buy_price) : null,
        sell_price: currencyForm.sell_price ? parseFloat(currencyForm.sell_price) : null
      };

      if (editingCurrency) {
        const { error } = await supabase
          .from('currencies')
          .update(data)
          .eq('id', editingCurrency.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('currencies')
          .insert(data);
        if (error) throw error;
      }

      toast({ title: language === 'ar' ? 'تم الحفظ' : 'Saved' });
      setShowCurrencyDialog(false);
      setEditingCurrency(null);
      setCurrencyForm({ code: '', name_ar: '', name_en: '', type: 'currency', buy_price: '', sell_price: '' });
      fetchAllData();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteCurrency = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    const { error } = await supabase.from('currencies').delete().eq('id', id);
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      fetchAllData();
    }
  };

  const handleToggleVerify = async (profile: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !profile.is_verified })
      .eq('id', profile.id);
    
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      fetchAllData();
    }
  };

  const handleDeleteProfile = async (userId: string) => {
    if (!confirm(t.confirmDelete)) return;
    const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      fetchAllData();
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      fetchAllData();
    }
  };

  const handleSaveSettings = async () => {
    for (const setting of settings) {
      await supabase
        .from('site_settings')
        .update({ value: setting.value })
        .eq('id', setting.id);
    }
    toast({ title: language === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved' });
  };

  const updateSettingValue = (key: string, field: string, value: any) => {
    setSettings(prev => prev.map(s => {
      if (s.key === key) {
        return { ...s, value: { ...s.value, [field]: value } };
      }
      return s;
    }));
  };

  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || {};

  const openEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency);
    setCurrencyForm({
      code: currency.code,
      name_ar: currency.name_ar,
      name_en: currency.name_en,
      type: currency.type,
      buy_price: currency.buy_price?.toString() || '',
      sell_price: currency.sell_price?.toString() || ''
    });
    setShowCurrencyDialog(true);
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const filteredCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name_ar.includes(searchQuery) ||
    c.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfiles = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredComments = comments.filter(c =>
    c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.currency_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-gray-100 via-purple-50 to-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm p-4 flex justify-between items-center sticky top-0 z-10`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Shield className="text-purple-500" size={24} />
            {t.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Globe size={20} />
          </button>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className={`flex gap-2 mb-6 overflow-x-auto pb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {(['currencies', 'users', 'comments', 'wallets', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
              }`}
            >
              {tab === 'currencies' && <Coins size={18} />}
              {tab === 'users' && <Users size={18} />}
              {tab === 'comments' && <MessageSquare size={18} />}
              {tab === 'wallets' && <Wallet size={18} />}
              {tab === 'settings' && <Settings size={18} />}
              {t[tab as keyof typeof t]}
            </button>
          ))}
        </div>

        {/* Search */}
        {activeTab !== 'settings' && (
          <div className="relative mb-6">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
              }`}
            />
          </div>
        )}

        {/* Currencies Tab */}
        {activeTab === 'currencies' && (
          <div>
            <button
              onClick={() => {
                setEditingCurrency(null);
                setCurrencyForm({ code: '', name_ar: '', name_en: '', type: 'currency', buy_price: '', sell_price: '' });
                setShowCurrencyDialog(true);
              }}
              className="mb-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold"
            >
              <Plus size={18} />
              {t.addCurrency}
            </button>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className="px-4 py-3 text-right">{t.code}</th>
                      <th className="px-4 py-3 text-right">{t.nameAr}</th>
                      <th className="px-4 py-3 text-right">{t.type}</th>
                      <th className="px-4 py-3 text-right">{t.buyPrice}</th>
                      <th className="px-4 py-3 text-right">{t.sellPrice}</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                    {filteredCurrencies.map((currency) => (
                      <tr key={currency.id} className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                        <td className={`px-4 py-3 font-mono font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currency.code}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{currency.name_ar}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{currency.type}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{currency.buy_price || '-'}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{currency.sell_price || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openEditCurrency(currency)}
                              className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCurrency(currency.id)}
                              className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-4 py-3 text-right">{t.memberNumber}</th>
                    <th className="px-4 py-3 text-right">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                    <th className="px-4 py-3 text-right">{language === 'ar' ? 'المستخدم' : 'Username'}</th>
                    <th className="px-4 py-3 text-right">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 font-mono ${darkMode ? 'text-white' : 'text-gray-800'}`}>#{profile.member_number}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{profile.full_name || '-'}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>@{profile.username || '-'}</td>
                      <td className="px-4 py-3">
                        {profile.is_verified ? (
                          <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle size={16} />
                            {t.verify}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500">
                            <XCircle size={16} />
                            {t.unverify}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleToggleVerify(profile)}
                            className={`p-2 rounded-lg ${
                              profile.is_verified 
                                ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' 
                                : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                            }`}
                          >
                            {profile.is_verified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(profile.user_id)}
                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden`}>
            <div className="divide-y divide-gray-700">
              {filteredComments.length === 0 ? (
                <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t.noData}
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <div key={comment.id} className={`p-4 flex items-start justify-between ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <div className="flex-1">
                      <p className={`${darkMode ? 'text-white' : 'text-gray-800'}`}>{comment.content}</p>
                      <div className={`flex gap-4 mt-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span>📍 {comment.currency_code}</span>
                        <span>👤 {comment.is_guest ? comment.guest_name : 'Member'}</span>
                        <span>📅 {new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Wallets Tab */}
        {activeTab === 'wallets' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-4 py-3 text-right">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                    <th className="px-4 py-3 text-right">{t.balance}</th>
                  </tr>
                </thead>
                <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                  {wallets.map((wallet) => (
                    <tr key={wallet.id} className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {wallet.profiles?.full_name || wallet.profiles?.username || 'Unknown'}
                      </td>
                      <td className={`px-4 py-3 font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {wallet.balance.toFixed(2)} DZD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {language === 'ar' ? 'إعدادات عامة' : 'General Settings'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.siteName}</label>
                  <input
                    type="text"
                    value={getSetting('general').site_name || ''}
                    onChange={(e) => updateSettingValue('general', 'site_name', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.siteDescription}</label>
                  <input
                    type="text"
                    value={getSetting('general').site_description || ''}
                    onChange={(e) => updateSettingValue('general', 'site_description', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Google OAuth Settings */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {language === 'ar' ? 'إعدادات Google OAuth' : 'Google OAuth Settings'}
              </h3>
              <div className="space-y-4">
                <label className={`flex items-center gap-3 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <input
                    type="checkbox"
                    checked={getSetting('google_oauth').enabled || false}
                    onChange={(e) => updateSettingValue('google_oauth', 'enabled', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  {t.googleEnabled}
                </label>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.googleClientId}</label>
                  <input
                    type="text"
                    value={getSetting('google_oauth').client_id || ''}
                    onChange={(e) => updateSettingValue('google_oauth', 'client_id', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                    placeholder="xxx.apps.googleusercontent.com"
                  />
                </div>
              </div>
            </div>

            {/* Notifications Settings */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
              </h3>
              <div className="space-y-4">
                <label className={`flex items-center gap-3 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <input
                    type="checkbox"
                    checked={getSetting('notifications').email_enabled || false}
                    onChange={(e) => updateSettingValue('notifications', 'email_enabled', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  {t.emailNotifications}
                </label>
                <label className={`flex items-center gap-3 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <input
                    type="checkbox"
                    checked={getSetting('notifications').push_enabled || false}
                    onChange={(e) => updateSettingValue('notifications', 'push_enabled', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  {t.pushNotifications}
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {t.saveSettings}
            </button>
          </div>
        )}
      </div>

      {/* Currency Dialog */}
      <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
        <DialogContent className={`sm:max-w-md ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle>
              {editingCurrency ? t.editCurrency : t.addCurrency}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.code}</label>
                <input
                  type="text"
                  value={currencyForm.code}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, code: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.type}</label>
                <select
                  value={currencyForm.type}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, type: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <option value="currency">Currency</option>
                  <option value="crypto">Crypto</option>
                  <option value="gold">Gold</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.nameAr}</label>
              <input
                type="text"
                value={currencyForm.name_ar}
                onChange={(e) => setCurrencyForm({ ...currencyForm, name_ar: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.nameEn}</label>
              <input
                type="text"
                value={currencyForm.name_en}
                onChange={(e) => setCurrencyForm({ ...currencyForm, name_en: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                }`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.buyPrice}</label>
                <input
                  type="number"
                  value={currencyForm.buy_price}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, buy_price: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.sellPrice}</label>
                <input
                  type="number"
                  value={currencyForm.sell_price}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, sell_price: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCurrencyDialog(false)}
                className={`flex-1 py-3 rounded-xl font-semibold ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveCurrency}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold"
              >
                {t.save}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
