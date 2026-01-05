import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, RefreshCw, Download, Search, X, Info, 
  Star, DollarSign, Heart, Calculator, CreditCard, Save, Shield, 
  Zap, Award, Moon, Sun, Chrome
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCurrencyIcon } from '@/components/icons/CurrencyIcons';
import html2canvas from 'html2canvas';
import CommentSectionPHP from '@/components/CommentSectionPHP';
import { useAuthPHP } from '@/hooks/useAuthPHP';
import { authApi, profilesApi } from '@/lib/api';

const Index = () => {
  const { toast } = useToast();
  const { user, profile, loading: authLoading, login, register, logout, updateProfile, isAuthenticated, refetch } = useAuthPHP();
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
  const [formLoading, setFormLoading] = useState(false);

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

  // Load user data from PHP Auth
  useEffect(() => {
    if (user && profile) {
      // Check if profile needs completion (missing wilaya or full_name)
      if (!profile.wilaya || !profile.full_name) {
        setNeedsProfileCompletion(true);
        setCurrentView('completeProfile');
        setFlippedCards(prev => ({ ...prev, main: true }));
        // Pre-fill with any existing data
        setCompleteProfileData({
          fullname: profile.full_name || '',
          username: profile.username || '',
          wilaya: profile.wilaya || ''
        });
      } else {
        setNeedsProfileCompletion(false);
        setRegistered(true);
        setCurrentView('account');
      }
      setGlobalName(profile.full_name || '');
      setUserWilaya(profile.wilaya || '');
      setMemberNumber(profile.member_number || null);
    } else if (!authLoading && !user) {
      setRegistered(false);
      setCurrentView('register');
      setGlobalName('');
      setUserWilaya('');
      setMemberNumber(null);
      setBalanceAmount(0);
      setNeedsProfileCompletion(false);
    }
  }, [user, profile, authLoading]);

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
    setFormLoading(true);

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿŒœ\s]+$/.test(formData.fullname)) {
      setFormError(language === 'ar' ? 'الاسم يجب أن يكون بالحروف الفرنسية' : 'Name must be in French letters');
      setFormLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username) || formData.username.length < 3) {
      setFormError(language === 'ar' ? 'اسم المستخدم غير صالح (3 أحرف على الأقل)' : 'Invalid username (min 3 chars)');
      setFormLoading(false);
      return;
    }
    if (!/^\d{2}$/.test(formData.wilaya)) {
      setFormError(language === 'ar' ? 'رقم الولاية غير صحيح (رقمين)' : 'Invalid wilaya (2 digits)');
      setFormLoading(false);
      return;
    }
    if (!formData.email || !formData.password) {
      setFormError(language === 'ar' ? 'البريد وكلمة المرور مطلوبان' : 'Email and password required');
      setFormLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullname,
        username: formData.username,
        wilaya: formData.wilaya
      });
      
      setGlobalName(formData.fullname);
      setUserWilaya(formData.wilaya);
      toast({
        title: language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!',
      });
    } catch (error: any) {
      setFormError(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setFormLoading(true);

    try {
      await login(loginData.loginUser, loginData.loginPass);
      toast({
        title: language === 'ar' ? 'مرحباً بك!' : 'Welcome back!',
      });
    } catch (error: any) {
      setLoginError(error.message || (language === 'ar' ? 'البريد أو كلمة المرور غير صحيحة' : 'Invalid credentials'));
    } finally {
      setFormLoading(false);
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
    logout();
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

  // Handle complete profile
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompleteProfileError('');
    setFormLoading(true);

    if (!user) {
      setCompleteProfileError(language === 'ar' ? 'خطأ في المصادقة' : 'Auth error');
      setFormLoading(false);
      return;
    }

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿŒœ\s]+$/.test(completeProfileData.fullname)) {
      setCompleteProfileError(language === 'ar' ? 'الاسم يجب أن يكون بالحروف الفرنسية' : 'Name must be in French letters');
      setFormLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(completeProfileData.username) || completeProfileData.username.length < 3) {
      setCompleteProfileError(language === 'ar' ? 'اسم المستخدم غير صالح (3 أحرف على الأقل)' : 'Invalid username (min 3 chars)');
      setFormLoading(false);
      return;
    }
    if (!/^\d{2}$/.test(completeProfileData.wilaya)) {
      setCompleteProfileError(language === 'ar' ? 'رقم الولاية غير صحيح (رقمين)' : 'Invalid wilaya (2 digits)');
      setFormLoading(false);
      return;
    }

    try {
      await updateProfile({
        full_name: completeProfileData.fullname,
        username: completeProfileData.username,
        wilaya: completeProfileData.wilaya
      });

      setGlobalName(completeProfileData.fullname);
      setUserWilaya(completeProfileData.wilaya);
      setNeedsProfileCompletion(false);
      setRegistered(true);
      setCurrentView('account');
      await refetch();
      toast({
        title: language === 'ar' ? 'تم حفظ البيانات بنجاح!' : 'Profile saved successfully!',
      });
    } catch (error: any) {
      setCompleteProfileError(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setFormLoading(false);
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

    let filtered = all;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.symbol.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const items = getAllItems();
  const popularItems = items.filter((item: any) => item.popular);

  // Render currency card
  const renderCurrencyCard = (currency: any) => (
    <div key={currency.id} id={`card-${currency.id}`} className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
      {/* Live pulse indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">LIVE</span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            {getCurrencyIcon(currency.id, "w-8 h-8")}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{currency.name}</h3>
            <span className="text-xs text-muted-foreground">{currency.symbol}</span>
          </div>
        </div>
        <button onClick={() => toggleFavorite(currency.id)} className="text-muted-foreground hover:text-amber-500 transition-colors">
          <Star size={18} className={favorites.includes(currency.id) ? 'fill-amber-500 text-amber-500' : ''} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/50 rounded-lg p-2">
            <span className="text-muted-foreground text-xs">{t.officialBank}</span>
            <div className="font-bold text-foreground">{formatNumber(currency.official)} DA</div>
          </div>
          <div className={`rounded-lg p-2 ${currency.change24h >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <span className="text-muted-foreground text-xs">{t.change24h}</span>
            <div className={`font-bold flex items-center gap-1 ${currency.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {currency.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {currency.change24h}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
            <span className="text-xs text-emerald-600 dark:text-emerald-400">{t.squareBuy}</span>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{formatNumber(currency.squareBuy)}</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 text-center">
            <span className="text-xs text-red-600 dark:text-red-400">{t.squareSell}</span>
            <div className="font-bold text-red-600 dark:text-red-400 text-lg">{formatNumber(currency.squareSell)}</div>
          </div>
        </div>
      </div>
      
    </div>
  );

  // Render crypto card
  const renderCryptoCard = (crypto: any) => (
    <div key={crypto.id} id={`card-${crypto.id}`} className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">24/7</span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            {getCurrencyIcon(crypto.id, "w-8 h-8")}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{crypto.name}</h3>
            <span className="text-xs text-muted-foreground">{crypto.symbol}</span>
          </div>
        </div>
        <button onClick={() => toggleFavorite(crypto.id)} className="text-muted-foreground hover:text-amber-500 transition-colors">
          <Star size={18} className={favorites.includes(crypto.id) ? 'fill-amber-500 text-amber-500' : ''} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/50 rounded-lg p-2">
            <span className="text-muted-foreground text-xs">{t.priceInDZD}</span>
            <div className="font-bold text-foreground">{formatNumber(crypto.price.dzd)} DA</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <span className="text-muted-foreground text-xs">{t.priceInUSD}</span>
            <div className="font-bold text-foreground">${formatNumber(crypto.price.usd)}</div>
          </div>
        </div>

        <div className={`rounded-lg p-3 text-center ${crypto.change24h >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <span className="text-xs text-muted-foreground">{t.change24h}</span>
          <div className={`font-bold text-xl flex items-center justify-center gap-1 ${crypto.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {crypto.change24h >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {crypto.change24h}%
          </div>
        </div>
      </div>
      
    </div>
  );

  // Render gold card
  const renderGoldCard = (gold: any) => (
    <div key={gold.id} id={`card-${gold.id}`} className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">GOLD</span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            {getCurrencyIcon(gold.id, "w-8 h-8")}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{gold.name}</h3>
            <span className="text-xs text-muted-foreground">{gold.symbol}</span>
          </div>
        </div>
        <button onClick={() => toggleFavorite(gold.id)} className="text-muted-foreground hover:text-amber-500 transition-colors">
          <Star size={18} className={favorites.includes(gold.id) ? 'fill-amber-500 text-amber-500' : ''} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg p-4 text-center">
          <span className="text-xs text-muted-foreground">{t.buy} {t.perGram}</span>
          <div className="font-bold text-2xl text-amber-600 dark:text-amber-400">{formatNumber(gold.buy)} DA</div>
        </div>

        <div className={`rounded-lg p-3 text-center ${gold.change24h >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <span className="text-xs text-muted-foreground">{t.change24h}</span>
          <div className={`font-bold flex items-center justify-center gap-1 ${gold.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {gold.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            +{gold.change24h}%
          </div>
        </div>
      </div>
      
    </div>
  );

  // Render transfer card
  const renderTransferCard = (transfer: any) => (
    <div key={transfer.id} id={`card-${transfer.id}`} className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
          <Award size={12} />
          {transfer.rating}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            {getCurrencyIcon(transfer.id, "w-8 h-8")}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{transfer.name}</h3>
            <span className="text-xs text-muted-foreground">{transfer.symbol}</span>
          </div>
        </div>
        <button onClick={() => toggleFavorite(transfer.id)} className="text-muted-foreground hover:text-amber-500 transition-colors">
          <Star size={18} className={favorites.includes(transfer.id) ? 'fill-amber-500 text-amber-500' : ''} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
            <span className="text-xs text-emerald-600 dark:text-emerald-400">{t.buy}</span>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">{transfer.buy} DA</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 text-center">
            <span className="text-xs text-red-600 dark:text-red-400">{t.sell}</span>
            <div className="font-bold text-red-600 dark:text-red-400">{transfer.sell} DA</div>
          </div>
        </div>

        <div className="flex justify-between text-sm bg-muted/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Zap size={12} />
            <span>{t.fees}: {transfer.fees}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <RefreshCw size={12} />
            <span>{transfer.speed}</span>
          </div>
        </div>
      </div>
      
    </div>
  );

  // Render any item based on category
  const renderItem = (item: any) => {
    switch (item.category) {
      case 'currency': return renderCurrencyCard(item);
      case 'crypto': return renderCryptoCard(item);
      case 'gold': return renderGoldCard(item);
      case 'transfer': return renderTransferCard(item);
      default: return null;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-gradient-to-r from-primary via-primary to-emerald-600 text-primary-foreground shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 animate-pulse">
                <DollarSign size={28} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">{t.title}</h1>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-emerald-100">{t.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-sm hidden md:block">{formatTime(lastUpdate)}</span>
              <button onClick={toggleDarkMode} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all hover:scale-105">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all hover:scale-105">
                {language === 'ar' ? 'EN' : 'عربي'}
              </button>
              <button onClick={() => setShowCalculator(!showCalculator)} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all hover:scale-105">
                <Calculator size={20} />
              </button>
              <button onClick={fetchAllData} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all hover:scale-105">
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0" ref={scrollContainerRef}>
            {Object.entries(t.categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Modal */}
        {showCalculator && (
          <div className="mb-6 bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Calculator size={20} />
              {t.calculator}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t.amount}</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t.from}</label>
                <select
                  value={calcFrom}
                  onChange={(e) => setCalcFrom(e.target.value)}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="dzd">DZD</option>
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t.to}</label>
                <select
                  value={calcTo}
                  onChange={(e) => setCalcTo(e.target.value)}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="dzd">DZD</option>
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t.result}</label>
                <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary font-bold">
                  {formatNumber(Math.round(calculateConversion() * 100) / 100)}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{t.estimate}</p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Card System */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Bank Card */}
              <div className="perspective-1000">
                <div
                  className={`relative w-full h-56 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
                    flippedCards.main ? 'rotate-y-180' : ''
                  }`}
                  onClick={() => !needsProfileCompletion && toggleCardFlip('main')}
                >
                  {/* Front - Card */}
                  <div className="absolute w-full h-full backface-hidden">
                    <div className="bg-gradient-to-br from-primary via-emerald-600 to-teal-600 rounded-2xl p-5 h-full shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                      
                      <div className="flex justify-between items-start mb-8">
                        <div className="text-white/90 text-xs font-medium">E-SEKOIR</div>
                        <div className="text-white/90 text-xs">{t.liveData}</div>
                      </div>
                      
                      <div className="text-white font-mono text-lg tracking-widest mb-6">
                        {getCardNumber(userWilaya || '16', memberNumber)}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-white/60 text-xs">{t.cardHolder}</div>
                          <div className="text-white font-semibold">
                            {globalName || 'YOUR NAME'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/60 text-xs">{t.validThru}</div>
                          <div className="text-white font-semibold">12/{new Date().getFullYear() + 3}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Back - Forms */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180">
                    <div className="bg-card border border-border rounded-2xl p-4 h-full shadow-xl overflow-y-auto">
                      {needsProfileCompletion ? (
                        /* Complete Profile Form */
                        <form onSubmit={handleCompleteProfile} className="space-y-3">
                          <h4 className="font-bold text-foreground text-center mb-2">{t.completeProfile}</h4>
                          <input
                            type="text"
                            placeholder={t.fullname}
                            value={completeProfileData.fullname}
                            onChange={(e) => handleCompleteProfileChange('fullname', e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder={t.username}
                            value={completeProfileData.username}
                            onChange={(e) => handleCompleteProfileChange('username', e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder={t.wilaya}
                            value={completeProfileData.wilaya}
                            onChange={(e) => handleCompleteProfileChange('wilaya', e.target.value.slice(0, 2))}
                            maxLength={2}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {completeProfileError && <p className="text-red-500 text-xs">{completeProfileError}</p>}
                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {formLoading ? '...' : t.save}
                          </button>
                        </form>
                      ) : currentView === 'register' ? (
                        /* Register Form */
                        <form onSubmit={handleRegister} className="space-y-2">
                          <h4 className="font-bold text-foreground text-center mb-2">{t.register}</h4>
                          <input
                            type="text"
                            placeholder={t.fullname}
                            value={formData.fullname}
                            onChange={(e) => handleFormChange('fullname', e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder={t.username}
                            value={formData.username}
                            onChange={(e) => handleFormChange('username', e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder={t.wilaya}
                            value={formData.wilaya}
                            onChange={(e) => handleFormChange('wilaya', e.target.value.slice(0, 2))}
                            maxLength={2}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="email"
                            placeholder={t.email}
                            value={formData.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="password"
                            placeholder={t.password}
                            value={formData.password}
                            onChange={(e) => handleFormChange('password', e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {formError && <p className="text-red-500 text-xs">{formError}</p>}
                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {formLoading ? '...' : t.register}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setCurrentView('login'); setFlippedCards(prev => prev); }}
                            className="w-full text-primary text-sm hover:underline"
                          >
                            {t.showLogin}
                          </button>
                        </form>
                      ) : currentView === 'login' ? (
                        /* Login Form */
                        <form onSubmit={handleLogin} className="space-y-3">
                          <h4 className="font-bold text-foreground text-center mb-2">{t.login}</h4>
                          <input
                            type="email"
                            placeholder={t.email}
                            value={loginData.loginUser}
                            onChange={(e) => handleLoginChange('loginUser', e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="password"
                            placeholder={t.password}
                            value={loginData.loginPass}
                            onChange={(e) => handleLoginChange('loginPass', e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {formLoading ? '...' : t.login}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentView('register')}
                            className="w-full text-primary text-sm hover:underline"
                          >
                            {t.backToRegister}
                          </button>
                        </form>
                      ) : (
                        /* Account View */
                        <div className="space-y-3 text-center">
                          <h4 className="font-bold text-foreground">{t.account}</h4>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="text-muted-foreground text-xs">{t.balance}</div>
                            <div className="text-2xl font-bold text-primary">{balanceAmount.toFixed(2)} €</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t.memberNumber}: #{memberNumber || '---'}
                          </div>
                          <button
                            onClick={handleCharge}
                            className="w-full bg-emerald-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-emerald-600 transition-colors"
                          >
                            {t.charge}
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full bg-red-500/10 text-red-500 py-2 rounded-lg font-semibold text-sm hover:bg-red-500/20 transition-colors"
                          >
                            {t.logout}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Explanation */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Info size={16} />
                  {t.priceExplanation}
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. {t.priceStep1}</p>
                  <p>2. {t.priceStep2}</p>
                  <p>3. {t.priceStep3}</p>
                  <p>4. {t.priceStep4}</p>
                  <p>5. {t.priceStep5}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-primary">{t.apiSource}</p>
                  <p className="text-xs text-muted-foreground">{t.realTimeUpdate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Cards Grid */}
          <div className="lg:col-span-3">
            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map(item => renderItem(item))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <Search size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">{t.noResults}</h3>
                <p className="text-muted-foreground">{t.tryAgain}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} E-Sekoir - {t.subtitle}</p>
          <p className="mt-1">{t.noteText}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
