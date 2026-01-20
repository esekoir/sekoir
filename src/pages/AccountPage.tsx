import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import {
  User, Settings, CreditCard, Wallet, History, LogOut,
  Camera, Edit, Save, X, DollarSign, Moon, Sun, Globe,
  Shield, CheckCircle, Zap, ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletData {
  id: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

const AccountPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showChargeDialog, setShowChargeDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    full_name: '',
    username: '',
    wilaya: ''
  });

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setEditData({
        full_name: p.full_name || '',
        username: p.username || '',
        wilaya: p.wilaya || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchTransactions();
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const translations = {
    ar: {
      title: 'حسابي',
      balance: 'الرصيد',
      charge: 'شحن الرصيد',
      transactions: 'سجل المعاملات',
      settings: 'الإعدادات',
      editProfile: 'تعديل الملف الشخصي',
      fullName: 'الاسم الكامل',
      username: 'اسم المستخدم',
      wilaya: 'الولاية',
      save: 'حفظ',
      cancel: 'إلغاء',
      logout: 'تسجيل الخروج',
      memberNumber: 'رقم العضوية',
      verified: 'موثق',
      notVerified: 'غير موثق',
      changePhoto: 'تغيير الصورة',
      noTransactions: 'لا توجد معاملات',
      chargeTitle: 'شحن الرصيد',
      chargeDescription: 'خدمة شحن الرصيد ستكون متوفرة قريباً',
      deposit: 'إيداع',
      withdrawal: 'سحب',
      pending: 'قيد الانتظار',
      completed: 'مكتمل',
      rejected: 'مرفوض',
      backToHome: 'العودة للرئيسية',
      adminPanel: 'لوحة التحكم'
    },
    en: {
      title: 'My Account',
      balance: 'Balance',
      charge: 'Charge Balance',
      transactions: 'Transaction History',
      settings: 'Settings',
      editProfile: 'Edit Profile',
      fullName: 'Full Name',
      username: 'Username',
      wilaya: 'Wilaya',
      save: 'Save',
      cancel: 'Cancel',
      logout: 'Logout',
      memberNumber: 'Member #',
      verified: 'Verified',
      notVerified: 'Not Verified',
      changePhoto: 'Change Photo',
      noTransactions: 'No transactions',
      chargeTitle: 'Charge Balance',
      chargeDescription: 'Balance charging service will be available soon',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      pending: 'Pending',
      completed: 'Completed',
      rejected: 'Rejected',
      backToHome: 'Back to Home',
      adminPanel: 'Admin Panel'
    }
  };

  const t = translations[language];

  const fetchWallet = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setWallet(data);
    } else if (!error || error.code === 'PGRST116') {
      // Create wallet if doesn't exist
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (newWallet) setWallet(newWallet);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setTransactions(data);
    }
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

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editData.full_name,
          username: editData.username,
          wilaya: editData.wilaya
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({ title: language === 'ar' ? 'تم حفظ التغييرات' : 'Changes saved' });
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: language === 'ar' ? 'الحجم أكبر من 2MB' : 'File too large (max 2MB)', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({ title: language === 'ar' ? 'تم تحديث الصورة' : 'Avatar updated' });
      window.location.reload();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getCardNumber = () => {
    const year = new Date().getFullYear();
    const p = profile as any;
    const wilaya = (p?.wilaya || '16').padStart(2, '0');
    const memberNum = (p?.member_number || 1).toString().padStart(4, '0');
    return `${year} ${wilaya}00 0000 ${memberNum}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900' : 'bg-gradient-to-br from-gray-100 via-emerald-50 to-gray-100'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50`}>
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t.title}</h1>
        <div className="flex items-center gap-2">
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

      <div className="container mx-auto px-4 py-6 max-w-2xl pt-20 pb-24">
        {/* Profile Card */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden mb-6`}>
          {/* Bank Card Style Header */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-white/70" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera size={14} className="text-emerald-600" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{(profile as any)?.full_name || 'E-Sekoir User'}</h2>
                  <p className="text-emerald-100">@{(profile as any)?.username || 'user'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(profile as any)?.is_verified ? (
                      <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        <CheckCircle size={12} />
                        {t.verified}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                        <Shield size={12} />
                        {t.notVerified}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 font-mono text-lg tracking-widest">{getCardNumber()}</div>
            <div className="text-xs text-emerald-100 mt-1">{t.memberNumber}: {(profile as any)?.member_number || '---'}</div>
          </div>

          {/* Balance Section */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.balance}</p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {wallet?.balance?.toFixed(2) || '0.00'} DZD
                </p>
              </div>
              <button
                onClick={() => setShowChargeDialog(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Zap size={20} />
                {t.charge}
              </button>
            </div>
          </div>

          {/* Edit Profile Section */}
          <div className={`p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t.editProfile}</h3>
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isEditing 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isEditing ? <Save size={16} /> : <Edit size={16} />}
                {isEditing ? t.save : t.editProfile}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.fullName}</label>
                <input
                  type="text"
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                      : 'bg-gray-50 border-gray-300 text-gray-800 disabled:bg-gray-100'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.username}</label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                        : 'bg-gray-50 border-gray-300 text-gray-800 disabled:bg-gray-100'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.wilaya}</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editData.wilaya}
                    onChange={(e) => setEditData({ ...editData, wilaya: e.target.value.replace(/\D/g, '') })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                        : 'bg-gray-50 border-gray-300 text-gray-800 disabled:bg-gray-100'
                    }`}
                  />
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className={`w-full py-3 rounded-xl font-semibold ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t.cancel}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden mb-6`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <History size={20} />
              {t.transactions}
            </h3>
          </div>
          <div className="divide-y divide-gray-700">
            {transactions.length === 0 ? (
              <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t.noTransactions}
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className={`p-4 flex items-center justify-between ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      <Wallet className={tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'} size={20} />
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {tx.type === 'deposit' ? t.deposit : t.withdrawal}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount} DZD
                    </p>
                    <p className={`text-sm ${getStatusColor(tx.status)}`}>
                      {t[tx.status as keyof typeof t] || tx.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admin Panel Button */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg mb-4"
          >
            <Shield size={20} />
            {t.adminPanel}
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
            darkMode 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <LogOut size={20} />
          {t.logout}
        </button>
      </div>

      {/* Charge Dialog */}
      <Dialog open={showChargeDialog} onOpenChange={setShowChargeDialog}>
        <DialogContent className={`sm:max-w-md ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🚀 {language === 'ar' ? 'قريباً!' : 'Coming Soon!'}
            </DialogTitle>
          </DialogHeader>
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.chargeDescription}
          </p>
          <button
            onClick={() => setShowChargeDialog(false)}
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-bold"
          >
            {language === 'ar' ? 'حسناً' : 'Got it!'}
          </button>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation language={language} />
    </div>
  );
};

export default AccountPage;
