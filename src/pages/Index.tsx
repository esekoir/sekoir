import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, RefreshCw, Download, Search, X, Info, 
  Star, DollarSign, Heart, Calculator, CreditCard, Save, Shield, 
  Zap, Award, Moon, Sun, Chrome
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCurrencyIcon } from '@/components/icons/CurrencyIcons';
import html2canvas from 'html2canvas';
import CommentSection from '@/components/CommentSection';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const Index = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState<'ar' | 'en'>('en');
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcAmount, setCalcAmount] = useState(100);
  const [calcFrom, setCalcFrom] = useState('eur');
  const [calcTo, setCalcTo] = useState('dzd');
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Card System State
  const [registered, setRegistered] = useState(false);
  const [globalName, setGlobalName] = useState("");
  const [userWilaya, setUserWilaya] = useState("");
  const [memberNumber, setMemberNumber] = useState<number | null>(null);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [currentView, setCurrentView] = useState('register');
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [flippedCards, setFlippedCards] = useState({
    main: false,
    card2: false,
    card3: false,
    card4: false,
    card5: false
  });
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    wilaya: '',
    email: '',
    password: ''
  });
  const [loginData, setLoginData] = useState({
    loginUser: '',
    loginPass: ''
  });
  const [completeProfileData, setCompleteProfileData] = useState({
    fullname: '',
    username: '',
    wilaya: ''
  });
  const [formError, setFormError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [completeProfileError, setCompleteProfileError] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Translations
  const translations = {
    ar: {
      title: 'E-Sekoir',
      subtitle: 'منصة الصرف الشاملة',
      search: 'ابحث عن عملة، ذهب، منصة...',
      calculator: 'حاسبة التحويل',
      categories: { all: 'الكل', currency: 'العملات', crypto: 'الرقمية', gold: 'الذهب', transfer: 'التحويل' },
      popular: 'الأكثر تداولاً',
      noResults: 'لا توجد نتائج',
      tryAgain: 'حاول البحث بكلمات أخرى',
      officialBank: 'البنك الرسمي',
      squareBuy: 'شراء السكوار',
      squareSell: 'بيع السكوار',
      change24h: 'التغير 24 ساعة',
      priceInDZD: 'السعر بالدينار',
      priceInUSD: 'السعر بالدولار',
      buy: 'شراء',
      sell: 'بيع',
      fees: 'الرسوم',
      speed: 'السرعة',
      rating: 'التقييم',
      amount: 'المبلغ',
      from: 'من',
      to: 'إلى',
      result: 'النتيجة',
      estimate: '* الأسعار تقديرية',
      favorites: 'المفضلة',
      download: 'تحميل',
      priceExplanation: 'كيف نحسب الأسعار؟',
      priceStep1: 'السعر الرسمي: من البنك المركزي عبر API موثوق',
      priceStep2: 'سعر السكوار الأساسي = السعر الرسمي × 1.85',
      priceStep3: 'سعر الشراء (أنت تبيع) = -2.7%',
      priceStep4: 'سعر البيع (أنت تشتري) = +2.7%',
      priceStep5: 'الفرق 5.4% = عمولة الصراف',
      apiSource: 'المصدر: ExchangeRate-API.com',
      realTimeUpdate: 'تحديث كل دقيقة',
      formulaTitle: 'معادلة الحساب',
      dataSource: 'مصدر البيانات',
      calculationMethod: 'طريقة الحساب',
      importantNote: 'ملاحظة مهمة:',
      noteText: 'أسعار السكوار تقديرية وقد تختلف قليلاً حسب المنطقة والصراف.',
      liveData: 'بيانات حية ودقيقة',
      perGram: 'للجرام',
      fullname: 'الاسم الكامل (بالفرنسية)',
      username: 'اسم المستخدم',
      wilaya: 'الولاية (رقمين)',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      save: 'حفظ',
      login: 'دخول',
      register: 'تسجيل',
      account: 'الحساب',
      balance: 'الرصيد',
      charge: 'شحن الرصيد',
      edit: 'تعديل المعلومات',
      logout: 'تسجيل الخروج',
      backToRegister: 'رجوع للتسجيل',
      completeProfile: 'أكمل بياناتك',
      memberNumber: 'رقم العضوية',
      showLogin: 'تسجيل الدخول',
      upgradeCard: 'ترقية البطاقة',
      cardHolder: 'اسم الحامل',
      validThru: 'صالحة حتى',
      loading: 'جاري التحميل...'
    },
    en: {
      title: 'E-Sekoir',
      subtitle: 'Complete Exchange Platform',
      search: 'Search...',
      calculator: 'Calculator',
      categories: { all: 'All', currency: 'Currencies', crypto: 'Crypto', gold: 'Gold', transfer: 'Transfer' },
      popular: 'Most Traded',
      noResults: 'No Results',
      tryAgain: 'Try different keywords',
      officialBank: 'Official Bank',
      squareBuy: 'Square Buy',
      squareSell: 'Square Sell',
      change24h: '24h Change',
      priceInDZD: 'Price in DZD',
      priceInUSD: 'Price in USD',
      buy: 'Buy',
      sell: 'Sell',
      fees: 'Fees',
      speed: 'Speed',
      rating: 'Rating',
      amount: 'Amount',
      from: 'From',
      to: 'To',
      result: 'Result',
      estimate: '* Est. prices',
      favorites: 'Favorites',
      download: 'Download',
      priceExplanation: 'How We Calculate?',
      priceStep1: 'Official Rate from API',
      priceStep2: 'Square = Official × 1.85',
      priceStep3: 'Buy = -2.7%',
      priceStep4: 'Sell = +2.7%',
      priceStep5: 'Diff 5.4% = Commission',
      apiSource: 'Source: ExchangeRate-API',
      realTimeUpdate: 'Updates every minute',
      formulaTitle: 'Formula',
      dataSource: 'Data Source',
      calculationMethod: 'Method',
      importantNote: 'Note:',
      noteText: 'Prices may vary by location.',
      liveData: 'Live data',
      perGram: 'per gram',
      fullname: 'Full Name (French)',
      username: 'Username',
      wilaya: 'Wilaya (2 digits)',
      email: 'Email',
      password: 'Password',
      save: 'Save',
      login: 'Login',
      register: 'Register',
      account: 'Account',
      balance: 'Balance',
      charge: 'Charge Balance',
      edit: 'Edit Info',
      logout: 'Logout',
      backToRegister: 'Back to Register',
      completeProfile: 'Complete Profile',
      memberNumber: 'Member #',
      showLogin: 'Login',
      upgradeCard: 'Upgrade Card',
      cardHolder: 'Card Holder',
      validThru: 'Valid Thru',
      loading: 'Loading...'
    }
  };

  const t = translations[language];

  // Load user data from Supabase Auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setRegistered(false);
        setCurrentView('register');
        setGlobalName('');
        setUserWilaya('');
        setMemberNumber(null);
        setBalanceAmount(0);
        setNeedsProfileCompletion(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      // Check if profile needs completion (missing wilaya or full_name)
      if (!data.wilaya || !data.full_name) {
        setNeedsProfileCompletion(true);
        setCurrentView('completeProfile');
        setFlippedCards(prev => ({ ...prev, main: true }));
        // Pre-fill with any existing data
        setCompleteProfileData({
          fullname: data.full_name || '',
          username: data.username || '',
          wilaya: data.wilaya || ''
        });
      } else {
        setNeedsProfileCompletion(false);
        setRegistered(true);
        setCurrentView('account');
      }
      setGlobalName(data.full_name || '');
      setUserWilaya(data.wilaya || '');
      setMemberNumber(data.member_number || null);
    } else {
      // New user from Google - needs profile completion
      setNeedsProfileCompletion(true);
      setCurrentView('completeProfile');
      setFlippedCards(prev => ({ ...prev, main: true }));
    }
  };

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fetch rates
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const currencyResponse = await fetch('https://api.exchangerate-api.com/v4/latest/DZD');
      const currencyData = await currencyResponse.json();
      setRates({ currencies: currencyData.rates });
      setLastUpdate(new Date());
    } catch (error) {
      setRates({ currencies: { EUR: 0.00665, USD: 0.00729, GBP: 0.00577, CAD: 0.01023, TRY: 0.21, AED: 0.0268 } });
    } finally {
      setLoading(false);
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

  const getSquareRate = (officialRate: number) => Math.round(officialRate * 1.85);
  const getSquareBuyRate = (officialRate: number) => Math.round(officialRate * 1.80);
  const getSquareSellRate = (officialRate: number) => Math.round(officialRate * 1.90);

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  // Download card as image function
  const downloadCardAsImage = async (cardId: string, cardName: string) => {
    const cardElement = document.getElementById(`card-${cardId}`);
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `${cardName}-${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: language === 'ar' ? 'تم تحميل الصورة بنجاح!' : 'Image downloaded successfully!',
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Error downloading image',
        variant: 'destructive',
      });
    }
  };

  const toggleCardFlip = (cardId: string) => {
    setFlippedCards({
      main: false,
      card2: false,
      card3: false,
      card4: false,
      card5: false
    });

    setTimeout(() => {
      setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
    }, 50);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleLoginChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setLoginError('');
  };

  const handleCompleteProfileChange = (field: string, value: string) => {
    setCompleteProfileData(prev => ({ ...prev, [field]: value }));
    setCompleteProfileError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setAuthLoading(true);

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿŒœ\s]+$/.test(formData.fullname)) {
      setFormError(language === 'ar' ? 'الاسم يجب أن يكون بالحروف الفرنسية' : 'Name must be in French letters');
      setAuthLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username) || formData.username.length < 3) {
      setFormError(language === 'ar' ? 'اسم المستخدم غير صالح (3 أحرف على الأقل)' : 'Invalid username (min 3 chars)');
      setAuthLoading(false);
      return;
    }
    if (!/^\d{2}$/.test(formData.wilaya)) {
      setFormError(language === 'ar' ? 'رقم الولاية غير صحيح (رقمين)' : 'Invalid wilaya (2 digits)');
      setAuthLoading(false);
      return;
    }
    if (!formData.email || !formData.password) {
      setFormError(language === 'ar' ? 'البريد وكلمة المرور مطلوبان' : 'Email and password required');
      setAuthLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullname,
            username: formData.username,
            wilaya: formData.wilaya,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullname)}`
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setFormError(language === 'ar' ? 'هذا البريد مسجل مسبقاً' : 'Email already registered');
        } else {
          setFormError(error.message);
        }
      } else if (data.user) {
        // Update profile with username and wilaya
        await supabase.from('profiles').update({ 
          full_name: formData.fullname,
          username: formData.username,
          wilaya: formData.wilaya 
        }).eq('user_id', data.user.id);
        
        setGlobalName(formData.fullname);
        setUserWilaya(formData.wilaya);
        toast({
          title: language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!',
        });
      }
    } catch (error) {
      setFormError(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.loginUser,
        password: loginData.loginPass
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setLoginError(language === 'ar' ? 'البريد أو كلمة المرور غير صحيحة' : 'Invalid credentials');
        } else {
          setLoginError(error.message);
        }
      } else {
        toast({
          title: language === 'ar' ? 'مرحباً بك!' : 'Welcome back!',
        });
      }
    } catch (error) {
      setLoginError(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'حدث خطأ' : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCharge = () => {
    const amount = prompt(language === 'ar' ? "أدخل مبلغ الشحن (€):" : "Enter charge amount (€):", "10");
    if (amount && !isNaN(Number(amount))) {
      const newBalance = balanceAmount + parseFloat(amount);
      setBalanceAmount(newBalance);
      toast({
        title: `✅ ${language === 'ar' ? 'تم شحن' : 'Charged'} ${amount} €`,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRegistered(false);
    setCurrentView('register');
    setGlobalName('');
    setUserWilaya('');
    setMemberNumber(null);
    setBalanceAmount(0);
    setNeedsProfileCompletion(false);
    setFormData({ fullname: '', username: '', wilaya: '', email: '', password: '' });
    setLoginData({ loginUser: '', loginPass: '' });
    setCompleteProfileData({ fullname: '', username: '', wilaya: '' });
    setFlippedCards({ main: false, card2: false, card3: false, card4: false, card5: false });
  };

  // Handle complete profile for Google users
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompleteProfileError('');
    setAuthLoading(true);

    if (!authUser) {
      setCompleteProfileError(language === 'ar' ? 'خطأ في المصادقة' : 'Auth error');
      setAuthLoading(false);
      return;
    }

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿŒœ\s]+$/.test(completeProfileData.fullname)) {
      setCompleteProfileError(language === 'ar' ? 'الاسم يجب أن يكون بالحروف الفرنسية' : 'Name must be in French letters');
      setAuthLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(completeProfileData.username) || completeProfileData.username.length < 3) {
      setCompleteProfileError(language === 'ar' ? 'اسم المستخدم غير صالح (3 أحرف على الأقل)' : 'Invalid username (min 3 chars)');
      setAuthLoading(false);
      return;
    }
    if (!/^\d{2}$/.test(completeProfileData.wilaya)) {
      setCompleteProfileError(language === 'ar' ? 'رقم الولاية غير صحيح (رقمين)' : 'Invalid wilaya (2 digits)');
      setAuthLoading(false);
      return;
    }

    try {
      // Check if username is taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', completeProfileData.username)
        .neq('user_id', authUser.id)
        .maybeSingle();

      if (existingUser) {
        setCompleteProfileError(language === 'ar' ? 'اسم المستخدم مستخدم بالفعل' : 'Username already taken');
        setAuthLoading(false);
        return;
      }

      const { error } = await supabase.from('profiles').upsert({
        user_id: authUser.id,
        full_name: completeProfileData.fullname,
        username: completeProfileData.username,
        wilaya: completeProfileData.wilaya,
        avatar_url: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(completeProfileData.fullname)}`
      }, { onConflict: 'user_id' });

      if (error) {
        if (error.message.includes('duplicate key') && error.message.includes('username')) {
          setCompleteProfileError(language === 'ar' ? 'اسم المستخدم مستخدم بالفعل' : 'Username already taken');
        } else {
          setCompleteProfileError(error.message);
        }
      } else {
        setGlobalName(completeProfileData.fullname);
        setUserWilaya(completeProfileData.wilaya);
        setNeedsProfileCompletion(false);
        setRegistered(true);
        setCurrentView('account');
        // Refetch to get member_number
        fetchUserProfile(authUser.id);
        toast({
          title: language === 'ar' ? 'تم حفظ البيانات بنجاح!' : 'Profile saved successfully!',
        });
      }
    } catch (error) {
      setCompleteProfileError(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const getCardNumber = (wilaya: string = '16', memNum: number | null = null) => {
    const year = new Date().getFullYear();
    const wilayaFormatted = wilaya.padStart(2, '0');
    const memberFormatted = memNum ? memNum.toString().padStart(4, '0') : '0001';
    return `${year} ${wilayaFormatted}00 0000 ${memberFormatted}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-DZ' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const calculateConversion = () => {
    if (!rates) return 0;
    let result = calcAmount;

    if (calcFrom === 'dzd') {
      if (calcTo === 'eur') result = calcAmount * (rates.currencies.EUR || 0.00665);
      else if (calcTo === 'usd') result = calcAmount * (rates.currencies.USD || 0.00729);
      else if (calcTo === 'gbp') result = calcAmount * (rates.currencies.GBP || 0.00577);
    } else if (calcTo === 'dzd') {
      if (calcFrom === 'eur') result = calcAmount / (rates.currencies.EUR || 0.00665);
      else if (calcFrom === 'usd') result = calcAmount / (rates.currencies.USD || 0.00729);
      else if (calcFrom === 'gbp') result = calcAmount / (rates.currencies.GBP || 0.00577);
    }

    return result;
  };

  // Exchange data
  const exchangeData = rates ? {
    currencies: [
      { id: 'eur', name: language === 'ar' ? 'اليورو' : 'Euro', symbol: 'EUR', icon: 'fa-euro-sign', category: 'currency',
        official: Math.round(1 / rates.currencies.EUR),
        square: getSquareRate(Math.round(1 / rates.currencies.EUR)),
        squareBuy: getSquareBuyRate(Math.round(1 / rates.currencies.EUR)),
        squareSell: getSquareSellRate(Math.round(1 / rates.currencies.EUR)),
        change24h: +(Math.random() * 2 - 1).toFixed(2), popular: true },
      { id: 'usd', name: language === 'ar' ? 'الدولار' : 'US Dollar', symbol: 'USD', icon: 'fa-dollar-sign', category: 'currency',
        official: Math.round(1 / rates.currencies.USD),
        square: getSquareRate(Math.round(1 / rates.currencies.USD)),
        squareBuy: getSquareBuyRate(Math.round(1 / rates.currencies.USD)),
        squareSell: getSquareSellRate(Math.round(1 / rates.currencies.USD)),
        change24h: +(Math.random() * 2 - 1).toFixed(2), popular: true },
      { id: 'gbp', name: language === 'ar' ? 'الجنيه' : 'Pound', symbol: 'GBP', icon: 'fa-sterling-sign', category: 'currency',
        official: Math.round(1 / rates.currencies.GBP),
        square: getSquareRate(Math.round(1 / rates.currencies.GBP)),
        squareBuy: getSquareBuyRate(Math.round(1 / rates.currencies.GBP)),
        squareSell: getSquareSellRate(Math.round(1 / rates.currencies.GBP)),
        change24h: +(Math.random() * 2 - 1).toFixed(2), popular: true },
      { id: 'cad', name: language === 'ar' ? 'الكندي' : 'Canadian', symbol: 'CAD', icon: 'fa-canadian-maple-leaf', category: 'currency',
        official: Math.round(1 / rates.currencies.CAD),
        square: getSquareRate(Math.round(1 / rates.currencies.CAD)),
        squareBuy: getSquareBuyRate(Math.round(1 / rates.currencies.CAD)),
        squareSell: getSquareSellRate(Math.round(1 / rates.currencies.CAD)),
        change24h: +(Math.random() * 2 - 1).toFixed(2), popular: false },
      { id: 'try', name: language === 'ar' ? 'الليرة التركية' : 'Turkish Lira', symbol: 'TRY', icon: 'fa-lira-sign', category: 'currency',
        official: Math.round(1 / rates.currencies.TRY),
        square: getSquareRate(Math.round(1 / rates.currencies.TRY)),
        squareBuy: getSquareBuyRate(Math.round(1 / rates.currencies.TRY)),
        squareSell: getSquareSellRate(Math.round(1 / rates.currencies.TRY)),
        change24h: +(Math.random() * 2 - 1).toFixed(2), popular: false },
      { id: 'aed', name: language === 'ar' ? 'الدرهم الإماراتي' : 'UAE Dirham', symbol: 'AED', icon: 'fa-coins', category: 'currency',
        official: Math.round(1 / rates.currencies.AED),
        square: getSquareRate(Math.round(1 / rates.currencies.AED)),
        squareBuy: getSquareBuyRate(Math.round(1 / rates.currencies.AED)),
        squareSell: getSquareSellRate(Math.round(1 / rates.currencies.AED)),
        change24h: +(Math.random() * 2 - 1).toFixed(2), popular: false }
    ],
    crypto: [
      { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: 'fa-bitcoin-sign', category: 'crypto',
        price: { dzd: 12500000, usd: 95000 },
        change24h: +(Math.random() * 10 - 5).toFixed(2), popular: true },
      { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'fa-ethereum', category: 'crypto',
        price: { dzd: 450000, usd: 3400 },
        change24h: +(Math.random() * 10 - 5).toFixed(2), popular: true },
      { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: 'fa-dollar-sign', category: 'crypto',
        price: { dzd: 137, usd: 1 },
        change24h: +(Math.random() * 0.5 - 0.25).toFixed(2), popular: true },
      { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', icon: 'fa-coins', category: 'crypto',
        price: { dzd: 85000, usd: 650 },
        change24h: +(Math.random() * 8 - 4).toFixed(2), popular: false }
    ],
    gold: [
      { id: 'gold24', name: language === 'ar' ? 'ذهب 24 قيراط' : 'Gold 24K', symbol: '24K', icon: 'fa-coins', category: 'gold', buy: 15500, change24h: +(Math.random() * 2).toFixed(2), popular: true },
      { id: 'gold21', name: language === 'ar' ? 'ذهب 21 قيراط' : 'Gold 21K', symbol: '21K', icon: 'fa-coins', category: 'gold', buy: 13500, change24h: +(Math.random() * 2).toFixed(2), popular: true },
      { id: 'gold18', name: language === 'ar' ? 'ذهب 18 قيراط' : 'Gold 18K', symbol: '18K', icon: 'fa-coins', category: 'gold', buy: 11500, change24h: +(Math.random() * 2).toFixed(2), popular: false }
    ],
    transfer: [
      { id: 'paysera', name: 'Paysera', symbol: 'EUR', icon: 'fa-credit-card', category: 'transfer', buy: 245, sell: 250, fees: '0.5%', speed: language === 'ar' ? 'فوري' : 'Instant', rating: 4.8 },
      { id: 'wise', name: 'Wise', symbol: 'EUR', icon: 'fa-globe', category: 'transfer', buy: 243, sell: 248, fees: '0.7%', speed: language === 'ar' ? '1-2 يوم' : '1-2 days', rating: 4.7 },
      { id: 'paypal', name: 'PayPal', symbol: 'USD', icon: 'fa-paypal', category: 'transfer', buy: 200, sell: 205, fees: '2.5%', speed: language === 'ar' ? 'فوري' : 'Instant', rating: 4.5 },
      { id: 'skrill', name: 'Skrill', symbol: 'EUR', icon: 'fa-wallet', category: 'transfer', buy: 240, sell: 245, fees: '1.5%', speed: language === 'ar' ? 'فوري' : 'Instant', rating: 4.3 }
    ]
  } : null;

  // Filter data
  const getAllItems = () => {
    if (!exchangeData) return [];
    const all = [
      ...exchangeData.currencies,
      ...exchangeData.crypto,
      ...exchangeData.gold,
      ...exchangeData.transfer
    ];
    return all.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  // Enhanced Bank Card Component
  const EnhancedBankCard = ({ cardId, title, gradient, cardNumber, isMain = false }: {
    cardId: string;
    title: string;
    gradient: string;
    cardNumber: string;
    isMain?: boolean;
  }) => {
    const isFlipped = flippedCards[cardId as keyof typeof flippedCards];
    const displayName = registered && globalName ? globalName.toUpperCase() : 'E-SEKOIR USER';
    const displayCardNumber = registered && userWilaya ? getCardNumber(userWilaya, memberNumber) : cardNumber;

    const handleCardClick = () => {
      if (isMain) {
        toggleCardFlip(cardId);
      }
    };

    const handleSimpleFlip = () => {
      if (!isMain) {
        toggleCardFlip(cardId);
      }
    };

    return (
      <div className="card-3d-container" onClick={handleSimpleFlip}>
        <div className={`card-3d ${isFlipped ? 'flipped' : ''}`}>
          <div
            className={`card-3d-face card-3d-front ${gradient}`}
            onClick={isMain ? handleCardClick : undefined}
          >
            <div className="text-2xl font-bold mb-3">{title}</div>
            <div className="card-chip"></div>
            <div className="text-xl tracking-wider font-semibold" style={{ letterSpacing: '0.15em' }} dir="ltr">
              {displayCardNumber}
            </div>
            <div className="flex justify-between items-end mt-4">
              <div>
                <div className="text-xs opacity-80 uppercase tracking-wide">{t.cardHolder}</div>
                <div className="text-sm font-semibold uppercase">{displayName}</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-80 uppercase tracking-wide">{t.validThru}</div>
                <div className="text-sm font-semibold">12/2028</div>
              </div>
            </div>
          </div>

          <div
            className={`card-3d-face card-3d-back ${gradient}`}
            onClick={(e) => { if (!isMain) e.stopPropagation(); }}
          >
            {isMain ? (
              <div className="card-scroll" onClick={(e) => e.stopPropagation()}>
                {currentView === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-2">
                    <label className="block text-xs font-medium opacity-90">{t.fullname}</label>
                    <input
                      type="text"
                      value={formData.fullname}
                      onChange={(e) => handleFormChange('fullname', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                    />

                    <label className="block text-xs font-medium opacity-90">{t.username}</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleFormChange('username', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                      placeholder="user123"
                    />

                    <label className="block text-xs font-medium opacity-90">{t.wilaya}</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.wilaya}
                      onChange={(e) => handleFormChange('wilaya', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                      placeholder="16"
                    />

                    <label className="block text-xs font-medium opacity-90">{t.email}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                    />

                    <label className="block text-xs font-medium opacity-90">{t.password}</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                    />

                    {formError && <div className="text-red-300 text-xs">{formError}</div>}

                    <button 
                      type="submit" 
                      disabled={authLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-400 text-white py-2 rounded-lg font-bold disabled:opacity-50"
                    >
                      {authLoading ? '...' : (language === 'ar' ? 'إنشاء حساب' : 'Create Account')}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={authLoading}
                      className="w-full bg-white text-gray-800 py-2 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Chrome size={16} />
                      Google
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCurrentView('login')}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 rounded-lg font-bold"
                    >
                      {t.showLogin}
                    </button>
                  </form>
                )}

                {currentView === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-2">
                    <label className="block text-xs font-medium opacity-90">{t.email}</label>
                    <input
                      type="email"
                      value={loginData.loginUser}
                      onChange={(e) => handleLoginChange('loginUser', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                    />

                    <label className="block text-xs font-medium opacity-90">{t.password}</label>
                    <input
                      type="password"
                      value={loginData.loginPass}
                      onChange={(e) => handleLoginChange('loginPass', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                    />

                    {loginError && <div className="text-red-300 text-xs">{loginError}</div>}

                    <button 
                      type="submit" 
                      disabled={authLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-400 text-white py-2 rounded-lg font-bold disabled:opacity-50"
                    >
                      {authLoading ? '...' : t.login}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={authLoading}
                      className="w-full bg-white text-gray-800 py-2 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Chrome size={16} />
                      Google
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCurrentView('register')}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 rounded-lg font-bold"
                    >
                      {t.backToRegister}
                    </button>
                  </form>
                )}

                {currentView === 'completeProfile' && (
                  <form onSubmit={handleCompleteProfile} className="space-y-2">
                    <div className="text-center mb-2">
                      <h3 className="text-sm font-bold">{t.completeProfile}</h3>
                    </div>
                    
                    <label className="block text-xs font-medium opacity-90">{t.fullname}</label>
                    <input
                      type="text"
                      value={completeProfileData.fullname}
                      onChange={(e) => handleCompleteProfileChange('fullname', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                    />

                    <label className="block text-xs font-medium opacity-90">{t.username}</label>
                    <input
                      type="text"
                      value={completeProfileData.username}
                      onChange={(e) => handleCompleteProfileChange('username', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                      placeholder="user123"
                    />

                    <label className="block text-xs font-medium opacity-90">{t.wilaya}</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={completeProfileData.wilaya}
                      onChange={(e) => handleCompleteProfileChange('wilaya', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border-none font-semibold text-sm caret-current ${darkMode ? 'bg-gray-700 text-white caret-white' : 'bg-white text-gray-800 caret-gray-800'}`}
                      required
                      autoComplete="off"
                      style={{ caretColor: 'auto' }}
                      placeholder="16"
                    />

                    {completeProfileError && <div className="text-red-300 text-xs">{completeProfileError}</div>}

                    <button 
                      type="submit" 
                      disabled={authLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-400 text-white py-2 rounded-lg font-bold disabled:opacity-50"
                    >
                      {authLoading ? '...' : t.save}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-red-500 to-red-400 text-white py-2 rounded-lg font-bold"
                    >
                      {t.logout}
                    </button>
                  </form>
                )}

                {currentView === 'account' && (
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-bold">{globalName}</h3>
                    <div className="text-xs opacity-80">{t.memberNumber}: {memberNumber || '-'}</div>
                    <div className="text-sm opacity-90">{t.balance}</div>
                    <div className="text-3xl font-bold">{balanceAmount.toFixed(2)} €</div>

                    <button
                      onClick={handleCharge}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 py-2 rounded-lg font-bold"
                    >
                      {t.charge}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-red-500 to-red-400 text-white py-2 rounded-lg font-bold"
                    >
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <button
                  className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 px-6 py-3 rounded-xl font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast({ title: t.upgradeCard });
                  }}
                >
                  {t.upgradeCard}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Ticker Component
  const PriceTicker = () => {
    if (!exchangeData) return null;
    
    const tickerItems = exchangeData.currencies.map(c => ({
      symbol: c.symbol,
      name: c.name,
      official: c.official,
      change: c.change24h
    }));
    
    const duplicatedItems = [...tickerItems, ...tickerItems];

    return (
      <div className="ticker-wrap bg-gradient-to-r from-emerald-700 to-blue-700 py-2 border-y border-white/10">
        <div className="ticker">
          {duplicatedItems.map((item, index) => (
            <div
              key={`${item.symbol}-${index}`}
              className="inline-flex items-center gap-3 px-6 border-l border-white/20 text-white"
            >
              <span className="font-bold">{item.symbol}</span>
              <span className="text-emerald-200 text-sm">{item.name}</span>
              <span className="font-bold">{formatNumber(item.official)} DZD</span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${item.change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Item Card
  const renderItemCard = (item: any) => {
    const isFavorite = favorites.includes(item.id);

    if (item.category === 'currency') {
      return (
        <div key={item.id} id={`card-${item.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-5 border border-gray-100 dark:border-gray-700 relative group glow-card">
          <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => toggleFavorite(item.id)}>
              <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-500"} />
            </button>
            <button 
              onClick={() => downloadCardAsImage(item.id, item.name)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Download size={12} />
              {t.download}
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shadow-md">
              {getCurrencyIcon(item.id, "w-12 h-12")}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.symbol}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{t.officialBank}</div>
              <div className="text-xl font-bold text-blue-800 dark:text-blue-200">{formatNumber(item.official)} DZD</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2">
                <div className="text-xs text-green-600 dark:text-green-400 font-semibold">{t.squareBuy}</div>
                <div className="text-lg font-bold text-green-800 dark:text-green-200">{formatNumber(item.squareBuy)}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-2">
                <div className="text-xs text-red-600 dark:text-red-400 font-semibold">{t.squareSell}</div>
                <div className="text-lg font-bold text-red-800 dark:text-red-200">{formatNumber(item.squareSell)}</div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500">{t.change24h}</span>
              <span className={`flex items-center gap-1 text-sm font-bold ${item.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(item.change24h)}%
              </span>
            </div>
            <CommentSection currencyCode={item.id} language={language} />
          </div>
        </div>
      );
    } else if (item.category === 'crypto') {
      return (
        <div key={item.id} id={`card-${item.id}`} className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl shadow-md hover:shadow-xl transition-all p-5 border border-purple-100 dark:border-purple-800 relative group glow-card">
          <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => toggleFavorite(item.id)}>
              <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-500"} />
            </button>
            <button 
              onClick={() => downloadCardAsImage(item.id, item.name)}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Download size={12} />
              {t.download}
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shadow-md">
              {getCurrencyIcon(item.id, "w-12 h-12")}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.symbol}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{t.priceInDZD}</div>
              <div className="text-xl font-bold text-purple-800 dark:text-purple-200">{formatNumber(item.price.dzd)} DZD</div>
            </div>
            <div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{t.priceInUSD}</div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">${formatNumber(item.price.usd)}</div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-purple-100 dark:border-purple-700">
              <span className="text-xs text-gray-500">{t.change24h}</span>
              <span className={`flex items-center gap-1 text-sm font-bold ${item.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(item.change24h)}%
              </span>
            </div>
            <CommentSection currencyCode={item.id} language={language} />
          </div>
        </div>
      );
    } else if (item.category === 'gold') {
      return (
        <div key={item.id} id={`card-${item.id}`} className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-xl shadow-md hover:shadow-xl transition-all p-5 border border-amber-200 dark:border-amber-700 relative group glow-card">
          <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => toggleFavorite(item.id)}>
              <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-500"} />
            </button>
            <button 
              onClick={() => downloadCardAsImage(item.id, item.name)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Download size={12} />
              {t.download}
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shadow-md">
              {getCurrencyIcon(item.id, "w-12 h-12")}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.symbol}</p>
            </div>
          </div>
          <div className="bg-amber-100 dark:bg-amber-800/30 rounded-lg p-3">
            <div className="text-xs text-amber-700 dark:text-amber-300 font-semibold">{t.buy}</div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{formatNumber(item.buy)} DZD</div>
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t.perGram}</div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-amber-200 dark:border-amber-700 mt-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">{t.change24h}</span>
            <span className={`flex items-center gap-1 text-sm font-bold ${item.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(item.change24h)}%
            </span>
          </div>
          <CommentSection currencyCode={item.id} language={language} />
        </div>
      );
    } else if (item.category === 'transfer') {
      return (
        <div key={item.id} id={`card-${item.id}`} className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl shadow-md hover:shadow-xl transition-all p-5 border border-indigo-200 dark:border-indigo-700 relative group glow-card">
          <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => toggleFavorite(item.id)}>
              <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-500"} />
            </button>
            <button 
              onClick={() => downloadCardAsImage(item.id, item.name)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Download size={12} />
              {t.download}
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shadow-md">
              {getCurrencyIcon(item.id, "w-12 h-12")}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.symbol}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2">
                <div className="text-xs text-green-600 dark:text-green-400 font-semibold">{t.buy}</div>
                <div className="text-lg font-bold text-green-800 dark:text-green-200">{formatNumber(item.buy)} DZD</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-2">
                <div className="text-xs text-red-600 dark:text-red-400 font-semibold">{t.sell}</div>
                <div className="text-lg font-bold text-red-800 dark:text-red-200">{formatNumber(item.sell)} DZD</div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.fees}</span>
              <span className="font-bold text-indigo-800 dark:text-indigo-300">{item.fees}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.speed}</span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">{item.speed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.rating}</span>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-500" fill="currentColor" />
                <span className="font-bold">{item.rating}</span>
              </div>
            </div>
            <CommentSection currencyCode={item.id} language={language} />
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50'}`}>
        <div className="text-center">
          <RefreshCw className={`animate-spin mx-auto mb-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} size={48} />
          <p className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                <DollarSign size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">{t.title}</h1>
                  <div className="flex items-center gap-1">
                    <span className="live-dot" />
                    <span className="text-xs font-semibold text-green-200">LIVE</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-100">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-100 hidden md:inline">{formatTime(lastUpdate)}</span>
              <button onClick={toggleDarkMode} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all">
                {language === 'ar' ? 'EN' : 'عربي'}
              </button>
              <button onClick={() => setShowCalculator(!showCalculator)} className="bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-all">
                <Calculator size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Live Price Ticker */}
      <PriceTicker />

      {/* Calculator */}
      {showCalculator && (
        <div className="bg-white dark:bg-gray-800 shadow-lg border-b-2 border-emerald-200 dark:border-emerald-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Calculator size={24} className="text-emerald-600" />
                {t.calculator}
              </h2>
              <button onClick={() => setShowCalculator(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.amount}</label>
                <input 
                  type="number" 
                  value={calcAmount === 0 ? '' : calcAmount} 
                  onChange={(e) => setCalcAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                  onFocus={(e) => { if (calcAmount === 0) e.target.value = ''; }}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.from}</label>
                <select value={calcFrom} onChange={(e) => setCalcFrom(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <option value="dzd">DZD</option>
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.to}</label>
                <select value={calcTo} onChange={(e) => setCalcTo(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <option value="dzd">DZD</option>
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.result}</label>
                <div className="w-full px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-600 rounded-lg font-bold text-emerald-800 dark:text-emerald-200 text-lg">
                  {formatNumber(Number(calculateConversion().toFixed(2)))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t.estimate}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Bank Cards */}
        <div className="relative mb-6">
          <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
            <EnhancedBankCard
              cardId="main"
              title="E-Sekoir"
              gradient="bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600"
              cardNumber="2026 1600 0000 0001"
              isMain={true}
            />
            <EnhancedBankCard
              cardId="card2"
              title="Green Plus"
              gradient="bg-gradient-to-br from-green-400 via-green-500 to-emerald-600"
              cardNumber="0000 0000 0000 0001"
            />
            <EnhancedBankCard
              cardId="card3"
              title="Gold"
              gradient="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600"
              cardNumber="0000 0000 0000 0002"
            />
            <EnhancedBankCard
              cardId="card4"
              title="Elite"
              gradient="bg-gradient-to-br from-red-400 via-red-500 to-rose-600"
              cardNumber="0000 0000 0000 0003"
            />
            <EnhancedBankCard
              cardId="card5"
              title="Blue Pro"
              gradient="bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600"
              cardNumber="0000 0000 0000 0004"
            />
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-emerald-500 focus:outline-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(t.categories).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${selectedCategory === key
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {getAllItems().map(item => renderItemCard(item))}
        </div>

        {getAllItems().length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">{t.noResults}</h3>
            <p className="text-gray-500 dark:text-gray-500">{t.tryAgain}</p>
          </div>
        )}

        {/* Price Explanation Note */}
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Info size={20} className="text-blue-600" />
            {t.priceExplanation}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">• {t.priceStep1}</p>
              <p className="text-gray-700 dark:text-gray-300">• {t.priceStep2}</p>
              <p className="text-gray-700 dark:text-gray-300">• {t.priceStep3}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">• {t.priceStep4}</p>
              <p className="text-gray-700 dark:text-gray-300">• {t.priceStep5}</p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">• {t.apiSource}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>{t.importantNote}</strong> {t.noteText}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign size={24} />
              <span className="text-xl font-bold">E-Sekoir</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">{t.subtitle}</p>
            <p className="text-gray-500 text-xs">© 2024 E-Sekoir. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
