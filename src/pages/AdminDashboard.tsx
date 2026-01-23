import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import {
  Users, MessageSquare, Coins, Settings, Shield, Trash2, Edit, Plus, 
  CheckCircle, XCircle, Search, Moon, Sun, Globe, Save, Wallet, RefreshCw,
  ShoppingCart, CreditCard, Image, FileText, Store, Bell, Zap
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
  icon_url: string | null;
  display_order: number;
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

interface MarketplaceListing {
  id: string;
  user_id: string;
  type: string;
  currency_code: string;
  amount: number;
  price_per_unit: number;
  total_price: number | null;
  description: string | null;
  contact_info: string | null;
  wilaya: string | null;
  is_active: boolean;
  created_at: string;
}

interface SiteSetting {
  id: string;
  key: string;
  value: any;
}

interface ChargeRequest {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  user_message: string | null;
  admin_note: string | null;
  created_at: string;
  profiles?: Profile;
}

interface VerificationRequest {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  profiles?: Profile;
  verification_plans?: { name_ar: string; name_en: string; price: number; duration_months: number };
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title_ar: string;
  title_en: string;
  message_ar: string | null;
  message_en: string | null;
  is_read: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'currencies' | 'users' | 'comments' | 'wallets' | 'listings' | 'chargeRequests' | 'verifyRequests' | 'notifications' | 'settings'>('currencies');
  
  // Data states
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [wallets, setWallets] = useState<WalletWithProfile[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [chargeRequests, setChargeRequests] = useState<ChargeRequest[]>([]);
  const [verifyRequests, setVerifyRequests] = useState<VerificationRequest[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showChargeDialog, setShowChargeDialog] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletWithProfile | null>(null);
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeNote, setChargeNote] = useState('');
  
  const [currencyForm, setCurrencyForm] = useState({
    code: '', name_ar: '', name_en: '', type: 'currency', buy_price: '', sell_price: '', icon_url: '', display_order: '0'
  });

  const translations = {
    ar: {
      title: 'لوحة التحكم',
      currencies: 'العملات',
      users: 'المستخدمين',
      comments: 'التعليقات',
      wallets: 'المحافظ',
      listings: 'المبيعات',
      settings: 'الإعدادات',
      chargeRequests: 'طلبات الشحن',
      verifyRequests: 'طلبات التوثيق',
      notifications: 'الإشعارات',
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
      verify: 'موثق',
      unverify: 'غير موثق',
      balance: 'الرصيد',
      memberNumber: 'رقم العضوية',
      noData: 'لا توجد بيانات',
      confirmDelete: 'هل أنت متأكد؟',
      backToHome: 'العودة للرئيسية',
      siteName: 'اسم الموقع',
      siteDescription: 'وصف الموقع',
      googleClientId: 'Google Client ID',
      googleClientSecret: 'Google Client Secret',
      googleEnabled: 'تفعيل تسجيل Google',
      emailNotifications: 'إشعارات البريد',
      pushNotifications: 'إشعارات Push',
      saveSettings: 'حفظ الإعدادات',
      unauthorized: 'غير مصرح لك بالوصول',
      shopEnabled: 'تفعيل السوق',
      shopDisabledNote: 'ملاحظة عند تعطيل السوق',
      siteNotice: 'ملاحظة الموقع',
      siteNoticeEnabled: 'إظهار الملاحظة',
      displayOrder: 'ترتيب العرض',
      iconUrl: 'رابط الأيقونة',
      active: 'نشط',
      inactive: 'معطل',
      toggleActive: 'تفعيل/تعطيل',
      editUser: 'تعديل المستخدم',
      chargeBalance: 'شحن الرصيد',
      amount: 'المبلغ',
      note: 'ملاحظة',
      charge: 'شحن',
      charged: 'تم شحن الرصيد',
      totalListings: 'إجمالي الإعلانات',
      activeListings: 'إعلانات نشطة',
      generalSettings: 'إعدادات عامة',
      shopSettings: 'إعدادات السوق',
      googleOAuth: 'إعدادات Google OAuth',
      siteAppearance: 'مظهر الموقع',
      logoUrl: 'رابط الشعار',
      faviconUrl: 'رابط Favicon',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الاستخدام',
      contactEmail: 'بريد التواصل',
      contactPhone: 'هاتف التواصل',
      socialMedia: 'روابط التواصل الاجتماعي',
      facebook: 'فيسبوك',
      instagram: 'انستغرام',
      telegram: 'تيليغرام',
      whatsapp: 'واتساب',
      currencyTypes: {
        currency: 'عملة',
        crypto: 'عملة رقمية',
        gold: 'ذهب',
        transfer: 'تحويل'
      }
    },
    en: {
      title: 'Admin Dashboard',
      currencies: 'Currencies',
      users: 'Users',
      comments: 'Comments',
      wallets: 'Wallets',
      listings: 'Listings',
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
      verify: 'Verified',
      unverify: 'Unverified',
      balance: 'Balance',
      memberNumber: 'Member #',
      noData: 'No data',
      confirmDelete: 'Are you sure?',
      backToHome: 'Back to Home',
      siteName: 'Site Name',
      siteDescription: 'Site Description',
      googleClientId: 'Google Client ID',
      googleClientSecret: 'Google Client Secret',
      googleEnabled: 'Enable Google Sign-in',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      saveSettings: 'Save Settings',
      unauthorized: 'Unauthorized access',
      shopEnabled: 'Enable Shop',
      shopDisabledNote: 'Shop Disabled Notice',
      siteNotice: 'Site Notice',
      siteNoticeEnabled: 'Show Notice',
      displayOrder: 'Display Order',
      iconUrl: 'Icon URL',
      active: 'Active',
      inactive: 'Inactive',
      toggleActive: 'Toggle Active',
      editUser: 'Edit User',
      chargeBalance: 'Charge Balance',
      amount: 'Amount',
      note: 'Note',
      charge: 'Charge',
      charged: 'Balance charged',
      totalListings: 'Total Listings',
      activeListings: 'Active Listings',
      generalSettings: 'General Settings',
      shopSettings: 'Shop Settings',
      googleOAuth: 'Google OAuth Settings',
      siteAppearance: 'Site Appearance',
      logoUrl: 'Logo URL',
      faviconUrl: 'Favicon URL',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      contactEmail: 'Contact Email',
      contactPhone: 'Contact Phone',
      socialMedia: 'Social Media Links',
      facebook: 'Facebook',
      instagram: 'Instagram',
      telegram: 'Telegram',
      whatsapp: 'WhatsApp',
      currencyTypes: {
        currency: 'Currency',
        crypto: 'Crypto',
        gold: 'Gold',
        transfer: 'Transfer'
      }
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
    const [currRes, profRes, commRes, walRes, listRes, settRes] = await Promise.all([
      supabase.from('currencies').select('*').order('display_order'),
      supabase.from('profiles').select('*').order('member_number'),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
      supabase.from('wallets').select('*, profiles(*)'),
      supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*')
    ]);

    if (currRes.data) setCurrencies(currRes.data);
    if (profRes.data) setProfiles(profRes.data);
    if (commRes.data) setComments(commRes.data);
    if (walRes.data) setWallets(walRes.data as any);
    if (listRes.data) setListings(listRes.data);
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
        sell_price: currencyForm.sell_price ? parseFloat(currencyForm.sell_price) : null,
        icon_url: currencyForm.icon_url || null,
        display_order: currencyForm.display_order ? parseInt(currencyForm.display_order) : 0
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
      setCurrencyForm({ code: '', name_ar: '', name_en: '', type: 'currency', buy_price: '', sell_price: '', icon_url: '', display_order: '0' });
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

  const handleDeleteListing = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    const { error } = await supabase.from('marketplace_listings').delete().eq('id', id);
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      fetchAllData();
    }
  };

  const handleToggleListingActive = async (listing: MarketplaceListing) => {
    const { error } = await supabase
      .from('marketplace_listings')
      .update({ is_active: !listing.is_active })
      .eq('id', listing.id);
    
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      fetchAllData();
    }
  };

  const handleChargeBalance = async () => {
    if (!selectedWallet || !chargeAmount) return;
    
    try {
      const amount = parseFloat(chargeAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({ title: language === 'ar' ? 'أدخل مبلغ صحيح' : 'Enter valid amount', variant: 'destructive' });
        return;
      }

      // Create a completed transaction
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: selectedWallet.id,
          user_id: selectedWallet.user_id,
          type: 'deposit',
          amount: amount,
          status: 'completed',
          description: chargeNote || (language === 'ar' ? 'شحن من الأدمن' : 'Admin charge'),
          admin_note: chargeNote
        });

      if (txError) throw txError;

      toast({ title: t.charged });
      setShowChargeDialog(false);
      setSelectedWallet(null);
      setChargeAmount('');
      setChargeNote('');
      fetchAllData();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const handleSaveSettings = async () => {
    try {
      for (const setting of settings) {
        await supabase
          .from('site_settings')
          .upsert({ 
            id: setting.id,
            key: setting.key, 
            value: setting.value,
            updated_at: new Date().toISOString()
          });
      }
      toast({ title: language === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved' });
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const updateSettingValue = (key: string, field: string, value: any) => {
    setSettings(prev => {
      const existing = prev.find(s => s.key === key);
      if (existing) {
        return prev.map(s => {
          if (s.key === key) {
            return { ...s, value: { ...s.value, [field]: value } };
          }
          return s;
        });
      } else {
        // Create new setting if doesn't exist
        return [...prev, { id: crypto.randomUUID(), key, value: { [field]: value } }];
      }
    });
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
      sell_price: currency.sell_price?.toString() || '',
      icon_url: currency.icon_url || '',
      display_order: currency.display_order?.toString() || '0'
    });
    setShowCurrencyDialog(true);
  };

  const handleToggleCurrencyActive = async (currency: Currency) => {
    const { error } = await supabase
      .from('currencies')
      .update({ is_active: !currency.is_active })
      .eq('id', currency.id);
    
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      fetchAllData();
    }
  };

  const openChargeDialog = (wallet: WalletWithProfile) => {
    setSelectedWallet(wallet);
    setChargeAmount('');
    setChargeNote('');
    setShowChargeDialog(true);
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

  const filteredListings = listings.filter(l =>
    l.currency_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { key: 'currencies', icon: Coins, label: t.currencies },
    { key: 'users', icon: Users, label: t.users },
    { key: 'wallets', icon: Wallet, label: t.wallets },
    { key: 'listings', icon: Store, label: t.listings },
    { key: 'comments', icon: MessageSquare, label: t.comments },
    { key: 'settings', icon: Settings, label: t.settings },
  ] as const;

  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-gray-100 via-purple-50 to-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50`}>
        <h1 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <Shield className="text-purple-500" size={24} />
          {t.title}
        </h1>
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

      <div className="container mx-auto px-4 py-6 pt-20">
        {/* Tabs */}
        <div className={`flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-purple-600 text-white'
                  : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
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
                setCurrencyForm({ code: '', name_ar: '', name_en: '', type: 'currency', buy_price: '', sell_price: '', icon_url: '', display_order: '0' });
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
                      <th className="px-4 py-3 text-right">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                    {filteredCurrencies.map((currency) => (
                      <tr key={currency.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} ${!currency.is_active ? 'opacity-50' : ''}`}>
                        <td className={`px-4 py-3 font-mono font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          <div className="flex items-center gap-2">
                            {currency.icon_url && <img src={currency.icon_url} alt="" className="w-6 h-6 rounded-full" />}
                            {currency.code}
                          </div>
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{currency.name_ar}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{(t.currencyTypes as any)[currency.type] || currency.type}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{currency.buy_price || '-'}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{currency.sell_price || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            currency.is_active 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {currency.is_active ? t.active : t.inactive}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleToggleCurrencyActive(currency)}
                              className={`p-2 rounded-lg ${
                                currency.is_active 
                                  ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' 
                                  : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                              }`}
                              title={t.toggleActive}
                            >
                              {currency.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
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
                      <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2">
                          {profile.avatar_url && <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full" />}
                          {profile.full_name || '-'}
                        </div>
                      </td>
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

        {/* Wallets Tab */}
        {activeTab === 'wallets' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-4 py-3 text-right">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                    <th className="px-4 py-3 text-right">{t.balance}</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                  {wallets.map((wallet) => (
                    <tr key={wallet.id} className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        <div className="flex items-center gap-2">
                          {wallet.profiles?.avatar_url && <img src={wallet.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full" />}
                          {wallet.profiles?.full_name || wallet.profiles?.username || 'Unknown'}
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {wallet.balance.toFixed(2)} DZD
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openChargeDialog(wallet)}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500/30 font-semibold"
                        >
                          <CreditCard size={16} />
                          {t.chargeBalance}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            <div className={`mb-4 flex gap-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 flex-1`}>
                <div className="text-sm opacity-70">{t.totalListings}</div>
                <div className="text-2xl font-bold">{listings.length}</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 flex-1`}>
                <div className="text-sm opacity-70">{t.activeListings}</div>
                <div className="text-2xl font-bold text-green-500">{listings.filter(l => l.is_active).length}</div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <tr>
                      <th className="px-4 py-3 text-right">{language === 'ar' ? 'النوع' : 'Type'}</th>
                      <th className="px-4 py-3 text-right">{language === 'ar' ? 'العملة' : 'Currency'}</th>
                      <th className="px-4 py-3 text-right">{language === 'ar' ? 'الكمية' : 'Amount'}</th>
                      <th className="px-4 py-3 text-right">{language === 'ar' ? 'السعر' : 'Price'}</th>
                      <th className="px-4 py-3 text-right">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                    {filteredListings.map((listing) => (
                      <tr key={listing.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} ${!listing.is_active ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            listing.type === 'sell' 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {listing.type === 'sell' ? (language === 'ar' ? 'بيع' : 'Sell') : (language === 'ar' ? 'شراء' : 'Buy')}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-mono font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{listing.currency_code}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{listing.amount}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{listing.price_per_unit} DZD</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            listing.is_active 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {listing.is_active ? t.active : t.inactive}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleToggleListingActive(listing)}
                              className={`p-2 rounded-lg ${
                                listing.is_active 
                                  ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' 
                                  : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                              }`}
                            >
                              {listing.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteListing(listing.id)}
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

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden`}>
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <Settings size={20} />
                {t.generalSettings}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.siteName}</label>
                  <input
                    type="text"
                    value={getSetting('general').site_name || ''}
                    onChange={(e) => updateSettingValue('general', 'site_name', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                    placeholder="E-Sekoir"
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
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.contactEmail}</label>
                  <input
                    type="email"
                    value={getSetting('general').contact_email || ''}
                    onChange={(e) => updateSettingValue('general', 'contact_email', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.contactPhone}</label>
                  <input
                    type="tel"
                    value={getSetting('general').contact_phone || ''}
                    onChange={(e) => updateSettingValue('general', 'contact_phone', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Site Appearance */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <Image size={20} />
                {t.siteAppearance}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.logoUrl}</label>
                  <input
                    type="text"
                    value={getSetting('appearance').logo_url || ''}
                    onChange={(e) => updateSettingValue('appearance', 'logo_url', e.target.value)}
                    placeholder="/logo.png"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.faviconUrl}</label>
                  <input
                    type="text"
                    value={getSetting('appearance').favicon_url || ''}
                    onChange={(e) => updateSettingValue('appearance', 'favicon_url', e.target.value)}
                    placeholder="/favicon.png"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Shop Settings */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <Store size={20} />
                {t.shopSettings}
              </h3>
              <div className="space-y-4">
                <label className={`flex items-center gap-3 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <input
                    type="checkbox"
                    checked={getSetting('shop').enabled !== false}
                    onChange={(e) => updateSettingValue('shop', 'enabled', e.target.checked)}
                    className="w-5 h-5 rounded accent-purple-600"
                  />
                  {t.shopEnabled}
                </label>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.shopDisabledNote}</label>
                  <textarea
                    value={getSetting('shop').disabled_message || ''}
                    onChange={(e) => updateSettingValue('shop', 'disabled_message', e.target.value)}
                    placeholder={language === 'ar' ? 'هذه الرسالة ستظهر عند تعطيل السوق...' : 'This message will appear when shop is disabled...'}
                    className={`w-full px-4 py-3 rounded-xl border resize-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                    }`}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Site Notice */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <MessageSquare size={20} />
                {language === 'ar' ? 'ملاحظة الموقع' : 'Site Notice'}
              </h3>
              <div className="space-y-4">
                <label className={`flex items-center gap-3 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <input
                    type="checkbox"
                    checked={getSetting('notice').enabled || false}
                    onChange={(e) => updateSettingValue('notice', 'enabled', e.target.checked)}
                    className="w-5 h-5 rounded accent-purple-600"
                  />
                  {t.siteNoticeEnabled}
                </label>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.siteNotice}</label>
                  <textarea
                    value={getSetting('notice').message || ''}
                    onChange={(e) => updateSettingValue('notice', 'message', e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب ملاحظة تظهر للزوار...' : 'Write a notice to display to visitors...'}
                    className={`w-full px-4 py-3 rounded-xl border resize-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400'
                    }`}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Google OAuth Settings */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <Globe size={20} />
                {t.googleOAuth}
              </h3>
              <div className="space-y-4">
                <label className={`flex items-center gap-3 cursor-pointer ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <input
                    type="checkbox"
                    checked={getSetting('google_oauth').enabled || false}
                    onChange={(e) => updateSettingValue('google_oauth', 'enabled', e.target.checked)}
                    className="w-5 h-5 rounded accent-purple-600"
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

            {/* Social Media */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t.socialMedia}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.facebook}</label>
                  <input
                    type="url"
                    value={getSetting('social').facebook || ''}
                    onChange={(e) => updateSettingValue('social', 'facebook', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.instagram}</label>
                  <input
                    type="url"
                    value={getSetting('social').instagram || ''}
                    onChange={(e) => updateSettingValue('social', 'instagram', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.telegram}</label>
                  <input
                    type="url"
                    value={getSetting('social').telegram || ''}
                    onChange={(e) => updateSettingValue('social', 'telegram', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.whatsapp}</label>
                  <input
                    type="tel"
                    value={getSetting('social').whatsapp || ''}
                    onChange={(e) => updateSettingValue('social', 'whatsapp', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                    placeholder="+213..."
                  />
                </div>
              </div>
            </div>

            {/* Legal Pages */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <FileText size={20} />
                {language === 'ar' ? 'صفحات قانونية' : 'Legal Pages'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.privacyPolicy}</label>
                  <textarea
                    value={getSetting('legal').privacy_policy || ''}
                    onChange={(e) => updateSettingValue('legal', 'privacy_policy', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border resize-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                    rows={5}
                    placeholder={language === 'ar' ? 'اكتب سياسة الخصوصية هنا...' : 'Write privacy policy here...'}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.termsOfService}</label>
                  <textarea
                    value={getSetting('legal').terms_of_service || ''}
                    onChange={(e) => updateSettingValue('legal', 'terms_of_service', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border resize-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                    rows={5}
                    placeholder={language === 'ar' ? 'اكتب شروط الاستخدام هنا...' : 'Write terms of service here...'}
                  />
                </div>
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
        <DialogContent className={`sm:max-w-lg max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : 'text-gray-800'}>
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
                  <option value="currency">{t.currencyTypes.currency}</option>
                  <option value="crypto">{t.currencyTypes.crypto}</option>
                  <option value="gold">{t.currencyTypes.gold}</option>
                  <option value="transfer">{t.currencyTypes.transfer}</option>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.iconUrl}</label>
                <input
                  type="text"
                  value={currencyForm.icon_url}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, icon_url: e.target.value })}
                  placeholder="/icons/xxx.png"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 placeholder-gray-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.displayOrder}</label>
                <input
                  type="number"
                  value={currencyForm.display_order}
                  onChange={(e) => setCurrencyForm({ ...currencyForm, display_order: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCurrencyDialog(false)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveCurrency}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-all"
              >
                {t.save}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charge Balance Dialog */}
      <Dialog open={showChargeDialog} onOpenChange={setShowChargeDialog}>
        <DialogContent className={`sm:max-w-md ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : 'text-gray-800'}>
              {t.chargeBalance}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{language === 'ar' ? 'المستخدم' : 'User'}</p>
              <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedWallet?.profiles?.full_name || selectedWallet?.profiles?.username || 'Unknown'}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'ar' ? 'الرصيد الحالي:' : 'Current balance:'} {selectedWallet?.balance.toFixed(2)} DZD
              </p>
            </div>
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.amount}</label>
              <input
                type="number"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                }`}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.note}</label>
              <input
                type="text"
                value={chargeNote}
                onChange={(e) => setChargeNote(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-800'
                }`}
                placeholder={language === 'ar' ? 'ملاحظة اختيارية...' : 'Optional note...'}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowChargeDialog(false)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleChargeBalance}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                {t.charge}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default AdminDashboard;