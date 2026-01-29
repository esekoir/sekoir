import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  Mail, Lock, User, Eye, EyeOff, ArrowRight, MapPin, 
  DollarSign, Moon, Sun, Globe 
} from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('البريد الإلكتروني غير صالح');
const passwordSchema = z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { darkMode, toggleDarkMode, language, toggleLanguage } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [legalContent, setLegalContent] = useState<{ privacy_policy?: string; terms_of_service?: string }>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    wilaya: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    wilaya: '',
    terms: ''
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/account');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch legal content from settings
  useEffect(() => {
    const fetchLegalContent = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'legal')
        .maybeSingle();
      
      if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
        const val = data.value as { privacy_policy?: string; terms_of_service?: string };
        setLegalContent(val);
      }
    };
    fetchLegalContent();
  }, []);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const translations = {
    ar: {
      title: 'E-Sekoir',
      subtitle: 'منصة الصرف الشاملة',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      loginSubtitle: 'تسجيل الدخول إلى حسابك',
      registerSubtitle: 'إنشاء حساب جديد',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      fullName: 'الاسم الكامل',
      username: 'اسم المستخدم',
      wilaya: 'الولاية (رقمين)',
      orContinueWith: 'أو تابع بـ',
      googleLogin: 'تسجيل بـ Google',
      noAccount: 'ليس لديك حساب؟',
      hasAccount: 'لديك حساب بالفعل؟',
      forgotPassword: 'نسيت كلمة المرور؟',
      resetPassword: 'استعادة كلمة المرور',
      resetDescription: 'أدخل بريدك الإلكتروني وسنرسل لك رابط لاستعادة كلمة المرور',
      sendResetLink: 'إرسال رابط الاستعادة',
      backToLogin: 'العودة لتسجيل الدخول',
      resetSent: 'تم إرسال رابط الاستعادة! تحقق من بريدك الإلكتروني',
      loading: 'جاري التحميل...'
    },
    en: {
      title: 'E-Sekoir',
      subtitle: 'Complete Exchange Platform',
      login: 'Login',
      register: 'Register',
      loginSubtitle: 'Login to your account',
      registerSubtitle: 'Create a new account',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      username: 'Username',
      wilaya: 'Wilaya (2 digits)',
      orContinueWith: 'Or continue with',
      googleLogin: 'Sign in with Google',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset Password',
      resetDescription: 'Enter your email and we will send you a reset link',
      sendResetLink: 'Send Reset Link',
      backToLogin: 'Back to Login',
      resetSent: 'Reset link sent! Check your email',
      loading: 'Loading...'
    }
  };

  const t = translations[language];


  const validateForm = () => {
    const newErrors = { email: '', password: '', fullName: '', username: '', wilaya: '', terms: '' };
    let isValid = true;

    try {
      emailSchema.parse(formData.email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
        isValid = false;
      }
    }

    try {
      passwordSchema.parse(formData.password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
        isValid = false;
      }
    }

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
        isValid = false;
      } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿŒœ\s]+$/.test(formData.fullName)) {
        newErrors.fullName = language === 'ar' ? 'الاسم يجب أن يكون بالحروف الفرنسية' : 'Name must be in French letters';
        isValid = false;
      }
      if (!formData.username.trim() || formData.username.length < 3) {
        newErrors.username = language === 'ar' ? 'اسم المستخدم مطلوب (3 أحرف على الأقل)' : 'Username required (min 3 chars)';
        isValid = false;
      }
      if (!/^\d{2}$/.test(formData.wilaya)) {
        newErrors.wilaya = language === 'ar' ? 'رقم الولاية غير صحيح (رقمين)' : 'Invalid wilaya (2 digits)';
        isValid = false;
      }
      if (!agreedToTerms) {
        newErrors.terms = language === 'ar' ? 'يجب الموافقة على الشروط والخصوصية' : 'You must agree to Terms and Privacy';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        toast({ title: language === 'ar' ? 'مرحباً بك!' : 'Welcome back!' });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: formData.fullName,
              username: formData.username,
              wilaya: formData.wilaya
            }
          }
        });
        if (error) throw error;
        toast({ title: language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!' });
        navigate('/');
      }
    } catch (error: any) {
      toast({ title: error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter your email', variant: 'destructive' });
      return;
    }
    
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) throw error;
      toast({ title: t.resetSent });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally {
      setResetLoading(false);
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
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900' : 'bg-gradient-to-br from-gray-100 via-emerald-50 to-gray-100'} flex flex-col`}>
      {/* Header - Fixed */}
      <header className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm p-4 flex justify-between items-center sticky top-0 z-10`}>
        <div className="flex items-center gap-2">
          <DollarSign className="text-emerald-500" size={28} />
          <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className={`${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl shadow-2xl p-8 border`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <DollarSign className="text-white" size={32} />
              </div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                {isLogin ? t.login : t.register}
              </h1>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {isLogin ? t.loginSubtitle : t.registerSubtitle}
              </p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className={`w-full mb-6 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
                darkMode 
                  ? 'bg-white text-gray-800 hover:bg-gray-100' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t.googleLogin}
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t.orContinueWith}</span>
              <div className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      {t.fullName}
                    </label>
                    <div className="relative">
                      <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`w-full pr-10 pl-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      {t.username}
                    </label>
                    <div className="relative">
                      <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className={`w-full pr-10 pl-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        placeholder="user123"
                      />
                    </div>
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      {t.wilaya}
                    </label>
                    <div className="relative">
                      <MapPin className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        maxLength={2}
                        value={formData.wilaya}
                        onChange={(e) => setFormData({ ...formData, wilaya: e.target.value.replace(/\D/g, '') })}
                        className={`w-full pr-10 pl-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        placeholder="16"
                        inputMode="numeric"
                      />
                    </div>
                    {errors.wilaya && <p className="text-red-500 text-sm mt-1">{errors.wilaya}</p>}
                  </div>
                </>
              )}

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pr-10 pl-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full pr-10 pl-12 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                
                {/* Forgot Password Link */}
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-emerald-500 text-sm hover:underline"
                  >
                    {t.forgotPassword}
                  </button>
                )}
              </div>

              {/* Terms & Privacy Checkbox - Only for Registration */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className={`flex items-start gap-3 cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded accent-emerald-600"
                    />
                    <span className="text-sm">
                      {language === 'ar' ? 'أوافق على ' : 'I agree to the '}
                      <button
                        type="button"
                        onClick={() => setShowTermsDialog(true)}
                        className="text-emerald-500 hover:underline font-semibold"
                      >
                        {language === 'ar' ? 'شروط الاستخدام' : 'Terms of Service'}
                      </button>
                      {language === 'ar' ? ' و' : ' and '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyDialog(true)}
                        className="text-emerald-500 hover:underline font-semibold"
                      >
                        {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                      </button>
                    </span>
                  </label>
                  {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? t.login : t.register}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {isLogin ? t.noAccount : t.hasAccount}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-emerald-500 font-semibold mr-2 hover:underline"
                >
                  {isLogin ? t.register : t.login}
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {t.resetPassword}
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.resetDescription}
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={`w-full pr-10 pl-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                  }`}
                  placeholder="example@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {resetLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  t.sendResetLink
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className={`w-full py-3 rounded-xl font-semibold ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t.backToLogin}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Terms of Service Dialog */}
      {showTermsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'ar' ? 'شروط الاستخدام' : 'Terms of Service'}
            </h3>
            <div className={`prose ${darkMode ? 'prose-invert' : ''} text-sm whitespace-pre-wrap`}>
              {legalContent.terms_of_service || (language === 'ar' ? 'لم يتم إضافة شروط الاستخدام بعد.' : 'Terms of Service not yet added.')}
            </div>
            <button
              onClick={() => setShowTermsDialog(false)}
              className="mt-4 w-full bg-emerald-500 text-white py-3 rounded-xl font-bold"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Dialog */}
      {showPrivacyDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h3>
            <div className={`prose ${darkMode ? 'prose-invert' : ''} text-sm whitespace-pre-wrap`}>
              {legalContent.privacy_policy || (language === 'ar' ? 'لم يتم إضافة سياسة الخصوصية بعد.' : 'Privacy Policy not yet added.')}
            </div>
            <button
              onClick={() => setShowPrivacyDialog(false)}
              className="mt-4 w-full bg-emerald-500 text-white py-3 rounded-xl font-bold"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default AuthPage;
