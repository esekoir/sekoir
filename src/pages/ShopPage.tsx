import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNavigation from '@/components/BottomNavigation';
import NotificationsPopover from '@/components/NotificationsPopover';
import MessagesPopover from '@/components/MessagesPopover';
import {
  ShoppingCart, Plus, TrendingUp, TrendingDown,
  MessageSquare, Send, User, MapPin, Filter, Edit, Trash2, Phone
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Listing {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  currency_code: string;
  amount: number;
  price_per_unit: number;
  total_price: number;
  description: string | null;
  contact_info: string | null;
  wilaya: string | null;
  is_active: boolean;
  created_at: string;
  payment_methods: string[] | null;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

interface MarketplaceComment {
  id: string;
  listing_id: string;
  user_id: string | null;
  guest_name: string | null;
  is_guest: boolean;
  content: string;
  likes_count: number;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

const ShopPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
  const { darkMode, language } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showLoginRequiredDialog, setShowLoginRequiredDialog] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [contactListing, setContactListing] = useState<Listing | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [comments, setComments] = useState<{ [key: string]: MarketplaceComment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [guestName, setGuestName] = useState('');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [shopSettings, setShopSettings] = useState<{ enabled: boolean; disabled_message: string }>({ enabled: true, disabled_message: '' });

  const [newListing, setNewListing] = useState({
    type: 'sell' as 'buy' | 'sell',
    currency_code: 'EUR',
    amount: '',
    price_per_unit: '',
    description: '',
    contact_info: '',
    wilaya: '',
    payment_methods: ['hand'] as string[]
  });

  const translations = {
    ar: {
      title: 'سوق العملات',
      subtitle: 'بيع وشراء العملات',
      createListing: 'إضافة إعلان',
      sell: 'بيع',
      buy: 'شراء',
      all: 'الكل',
      amount: 'الكمية',
      pricePerUnit: 'السعر للوحدة',
      totalPrice: 'المجموع',
      description: 'الوصف',
      contactInfo: 'معلومات الاتصال',
      wilaya: 'الولاية',
      currency: 'العملة',
      post: 'نشر',
      cancel: 'إلغاء',
      noListings: 'لا توجد إعلانات',
      loginToPost: 'سجل الدخول للإعلان',
      comments: 'تعليق',
      addComment: 'أضف تعليق...',
      yourName: 'اسمك',
      send: 'إرسال',
      backToHome: 'العودة للرئيسية',
      filter: 'فلترة',
      wantsToBuy: 'يريد شراء',
      wantsToSell: 'يريد بيع',
      dzd: 'دج',
      paymentMethod: 'طريقة الدفع',
      hand: 'يد بيد',
      ccp: 'CCP',
      baridimob: 'بريدي موب',
      mediator: 'عن طريق وسيط',
      contact: 'تواصل',
      editListing: 'تعديل الإعلان',
      deleteListing: 'حذف الإعلان',
      contactSeller: 'تواصل مع البائع',
      contactBuyer: 'تواصل مع المشتري',
      sendMessage: 'إرسال رسالة',
      messagePlaceholder: 'اكتب رسالتك هنا...',
      loginRequired: 'يجب تسجيل الدخول',
      loginRequiredDesc: 'للتواصل مع البائع أو المشتري، يجب أن تكون مسجلاً',
      loginBtn: 'تسجيل الدخول',
      registerBtn: 'إنشاء حساب جديد'
    },
    en: {
      title: 'Currency Market',
      subtitle: 'Buy & Sell Currencies',
      createListing: 'Create Listing',
      sell: 'Sell',
      buy: 'Buy',
      all: 'All',
      amount: 'Amount',
      pricePerUnit: 'Price/Unit',
      totalPrice: 'Total',
      description: 'Description',
      contactInfo: 'Contact Info',
      wilaya: 'Wilaya',
      currency: 'Currency',
      post: 'Post',
      cancel: 'Cancel',
      noListings: 'No listings',
      loginToPost: 'Login to post',
      comments: 'comments',
      addComment: 'Add comment...',
      yourName: 'Your name',
      send: 'Send',
      backToHome: 'Back to Home',
      filter: 'Filter',
      wantsToBuy: 'wants to buy',
      wantsToSell: 'wants to sell',
      dzd: 'DZD',
      paymentMethod: 'Payment Method',
      hand: 'Hand to hand',
      ccp: 'CCP',
      baridimob: 'BaridiMob',
      mediator: 'Via Mediator',
      contact: 'Contact',
      editListing: 'Edit Listing',
      deleteListing: 'Delete Listing',
      contactSeller: 'Contact Seller',
      contactBuyer: 'Contact Buyer',
      sendMessage: 'Send Message',
      messagePlaceholder: 'Write your message here...',
      loginRequired: 'Login Required',
      loginRequiredDesc: 'To contact the seller or buyer, you must be logged in',
      loginBtn: 'Login',
      registerBtn: 'Create Account'
    }
  };

  const t = translations[language];

  const currencies = ['EUR', 'USD', 'GBP', 'CAD', 'TRY', 'AED', 'BTC', 'USDT', 'ETH'];

  useEffect(() => {
    // Fetch shop settings first
    const fetchShopSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'shop')
        .maybeSingle();
      
      if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
        const val = data.value as { enabled?: boolean; disabled_message?: string };
        setShopSettings({
          enabled: val.enabled !== false,
          disabled_message: val.disabled_message || ''
        });
      }
    };
    fetchShopSettings();
    // Fetch listings without blocking UI
    fetchListings().finally(() => setInitialLoading(false));
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set((data || []).map(l => l.user_id).filter(Boolean))];
      let profilesMap: { [key: string]: any } = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url, is_verified')
          .in('user_id', userIds);
        
        if (profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.user_id] = p;
          });
        }
      }

      const listingsWithProfiles = (data || []).map(listing => ({
        ...listing,
        type: listing.type as 'buy' | 'sell',
        profiles: profilesMap[listing.user_id] || null
      }));
      
      setListings(listingsWithProfiles);

      // Fetch comments for all listings
      if (data && data.length > 0) {
        const listingIds = data.map(l => l.id);
        const { data: commentsData } = await supabase
          .from('marketplace_comments')
          .select('*')
          .in('listing_id', listingIds)
          .order('created_at', { ascending: true });

        if (commentsData) {
          // Get user profiles for comments
          const commentUserIds = [...new Set(commentsData.map(c => c.user_id).filter(Boolean))];
          let commentProfilesMap: { [key: string]: any } = {};
          
          if (commentUserIds.length > 0) {
            const { data: commentProfiles } = await supabase
              .from('profiles')
              .select('user_id, full_name, username, avatar_url')
              .in('user_id', commentUserIds);
            
            if (commentProfiles) {
              commentProfiles.forEach(p => {
                commentProfilesMap[p.user_id] = p;
              });
            }
          }

          const grouped: { [key: string]: MarketplaceComment[] } = {};
          commentsData.forEach((c: any) => {
            if (!grouped[c.listing_id]) grouped[c.listing_id] = [];
            grouped[c.listing_id].push({
              ...c,
              profiles: commentProfilesMap[c.user_id] || null
            });
          });
          setComments(grouped);
        }
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async () => {
    if (!user) {
      toast({ title: t.loginToPost, variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!newListing.amount || !newListing.price_per_unit) {
      toast({ title: language === 'ar' ? 'أدخل الكمية والسعر' : 'Enter amount and price', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .insert({
          user_id: user.id,
          type: newListing.type,
          currency_code: newListing.currency_code,
          amount: parseFloat(newListing.amount),
          price_per_unit: parseFloat(newListing.price_per_unit),
          description: newListing.description || null,
          contact_info: newListing.contact_info || null,
          wilaya: newListing.wilaya || (profile as any)?.wilaya || null,
          payment_methods: newListing.payment_methods
        });

      if (error) throw error;

      toast({ title: language === 'ar' ? 'تم نشر الإعلان!' : 'Listing posted!' });
      setShowCreateDialog(false);
      setNewListing({
        type: 'sell',
        currency_code: 'EUR',
        amount: '',
        price_per_unit: '',
        description: '',
        contact_info: '',
        wilaya: '',
        payment_methods: ['hand']
      });
      fetchListings();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateListing = async () => {
    if (!editingListing) return;
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({
          type: newListing.type,
          currency_code: newListing.currency_code,
          amount: parseFloat(newListing.amount),
          price_per_unit: parseFloat(newListing.price_per_unit),
          description: newListing.description || null,
          contact_info: newListing.contact_info || null,
          wilaya: newListing.wilaya || null,
          payment_methods: newListing.payment_methods
        })
        .eq('id', editingListing.id);

      if (error) throw error;

      toast({ title: language === 'ar' ? 'تم تحديث الإعلان!' : 'Listing updated!' });
      setShowEditDialog(false);
      setEditingListing(null);
      fetchListings();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل تريد حذف هذا الإعلان؟' : 'Delete this listing?')) return;
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: language === 'ar' ? 'تم حذف الإعلان' : 'Listing deleted' });
      fetchListings();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const openEditDialog = (listing: Listing) => {
    setEditingListing(listing);
    setNewListing({
      type: listing.type,
      currency_code: listing.currency_code,
      amount: listing.amount.toString(),
      price_per_unit: listing.price_per_unit.toString(),
      description: listing.description || '',
      contact_info: listing.contact_info || '',
      wilaya: listing.wilaya || '',
      payment_methods: listing.payment_methods || ['hand']
    });
    setShowEditDialog(true);
  };

  const openContactDialog = (listing: Listing) => {
    // Check if user is logged in
    if (!user) {
      setShowLoginRequiredDialog(true);
      return;
    }
    setContactListing(listing);
    setContactMessage('');
    setShowContactDialog(true);
  };

  const handleSendContactMessage = async () => {
    if (!contactListing || !contactMessage.trim()) return;
    try {
      await supabase.from('messages').insert({
        sender_id: user?.id || null,
        receiver_id: contactListing.user_id,
        sender_name: user ? (profile as any)?.full_name || (profile as any)?.username : guestName || 'Guest',
        content: contactMessage.trim(),
        listing_id: contactListing.id
      });
      toast({ title: language === 'ar' ? 'تم إرسال الرسالة!' : 'Message sent!' });
      setShowContactDialog(false);
      setContactMessage('');
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const togglePaymentMethod = (method: string) => {
    setNewListing(prev => {
      const methods = prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method];
      return { ...prev, payment_methods: methods.length > 0 ? methods : ['hand'] };
    });
  };

  const handleAddComment = async (listingId: string) => {
    const content = newComment[listingId]?.trim();
    if (!content) return;

    if (!user && !guestName.trim()) {
      toast({ title: language === 'ar' ? 'أدخل اسمك' : 'Enter your name', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_comments')
        .insert({
          listing_id: listingId,
          user_id: user?.id || null,
          guest_name: user ? null : guestName.trim(),
          is_guest: !user,
          content
        });

      if (error) throw error;

      setNewComment(prev => ({ ...prev, [listingId]: '' }));
      
      // Refetch comments for this listing
      const { data } = await supabase
        .from('marketplace_comments')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: true });

      if (data) {
        // Get profiles for comments
        const commentUserIds = [...new Set(data.map(c => c.user_id).filter(Boolean))];
        let profilesMap: { [key: string]: any } = {};
        
        if (commentUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name, username, avatar_url')
            .in('user_id', commentUserIds);
          
          if (profiles) {
            profiles.forEach(p => {
              profilesMap[p.user_id] = p;
            });
          }
        }
        
        const commentsWithProfiles = data.map(c => ({
          ...c,
          profiles: profilesMap[c.user_id] || null
        }));
        
        setComments(prev => ({ ...prev, [listingId]: commentsWithProfiles }));
      }
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const toggleComments = (listingId: string) => {
    setExpandedComments(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const filteredListings = listings.filter(listing => {
    if (filterType !== 'all' && listing.type !== filterType) return false;
    if (filterCurrency !== 'all' && listing.currency_code !== filterCurrency) return false;
    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: any = { hand: t.hand, ccp: t.ccp, baridimob: t.baridimob, mediator: t.mediator };
    return labels[method] || method;
  };

  // Always show main content with BottomNavigation - no early returns that hide navigation
  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100'}`}>
      {/* Bottom Navigation - Always visible */}
      <BottomNavigation />
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50`}>
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-blue-500" size={24} />
          <div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t.title}</h1>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MessagesPopover darkMode={darkMode} language={language} />
          <NotificationsPopover darkMode={darkMode} language={language} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl pt-20">
        {/* Shop Disabled Message */}
        {!shopSettings.enabled && (
          <div className={`mb-6 p-6 rounded-2xl text-center ${darkMode ? 'bg-red-900/30 border border-red-500/50' : 'bg-red-50 border border-red-200'}`}>
            <ShoppingCart size={48} className={`mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {language === 'ar' ? 'السوق معطل حالياً' : 'Shop is Currently Disabled'}
            </h2>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              {shopSettings.disabled_message || (language === 'ar' ? 'السوق مغلق مؤقتاً' : 'The marketplace is temporarily closed')}
            </p>
          </div>
        )}

        {shopSettings.enabled && (
          <>
        {/* Filters */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 mb-6 shadow-lg`}>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            
            {/* Type Filter */}
            <div className="flex gap-1">
              {['all', 'sell', 'buy'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    filterType === type
                      ? type === 'sell' ? 'bg-green-500 text-white' : type === 'buy' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {type === 'all' ? t.all : type === 'sell' ? t.sell : t.buy}
                </button>
              ))}
            </div>

            {/* Currency Filter */}
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className={`px-3 py-1 rounded-lg text-sm border-none ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              <option value="all">{t.all}</option>
              {currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Create Listing Button */}
        <button
          onClick={() => user ? setShowCreateDialog(true) : navigate('/auth')}
          className="w-full mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          {t.createListing}
        </button>

        {/* Listings */}
        <div className="space-y-4">
          {initialLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {t.noListings}
            </div>
          ) : (
            filteredListings.map((listing) => (
              <div
                key={listing.id}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}
              >
                {/* Post Header */}
                <div className="p-4 flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                    {listing.profiles?.avatar_url ? (
                      <img src={listing.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {listing.profiles?.full_name || listing.profiles?.username || 'User'}
                      </span>
                      {listing.profiles?.is_verified && (
                        <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">✓</span>
                      )}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-2`}>
                      <span>{formatDate(listing.created_at)}</span>
                      {listing.wilaya && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {listing.wilaya}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    listing.type === 'sell' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {listing.type === 'sell' ? t.sell : t.buy}
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-4">
                  <div className={`text-lg mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <span className="font-bold">
                      {listing.type === 'sell' ? t.wantsToSell : t.wantsToBuy}
                    </span>
                    {' '}
                    <span className="text-2xl font-bold text-blue-500">
                      {listing.amount} {listing.currency_code}
                    </span>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-xl p-3 mb-3`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{t.pricePerUnit}</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {listing.price_per_unit} {t.dzd}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{t.totalPrice}</span>
                      <span className="font-bold text-xl text-green-500">
                        {listing.total_price?.toLocaleString()} {t.dzd}
                      </span>
                    </div>
                  </div>

                  {listing.description && (
                    <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {listing.description}
                    </p>
                  )}

                  {/* Payment Methods */}
                  {listing.payment_methods && listing.payment_methods.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {listing.payment_methods.map(method => (
                        <span 
                          key={method}
                          className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        >
                          {getPaymentMethodLabel(method)}
                        </span>
                      ))}
                    </div>
                  )}

                  {listing.contact_info && (
                    <p className={`text-sm mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      📞 {listing.contact_info}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => openContactDialog(listing)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm"
                    >
                      <Phone size={16} />
                      {listing.type === 'sell' ? t.contactSeller : t.contactBuyer}
                    </button>
                    {user?.id === listing.user_id && (
                      <>
                        <button
                          onClick={() => openEditDialog(listing)}
                          className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="p-2 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleComments(listing.id)}
                    className={`w-full px-4 py-3 flex items-center gap-2 ${darkMode ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <MessageSquare size={18} />
                    <span>{comments[listing.id]?.length || 0} {t.comments}</span>
                  </button>

                  {expandedComments.includes(listing.id) && (
                    <div className={`px-4 pb-4 ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                      {/* Comments List */}
                      <div className="space-y-3 mb-3">
                        {(comments[listing.id] || []).map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                              {comment.profiles?.avatar_url ? (
                                <img src={comment.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User size={14} className="text-white" />
                              )}
                            </div>
                            <div className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl px-3 py-2`}>
                              <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {comment.is_guest ? comment.guest_name : (comment.profiles?.full_name || comment.profiles?.username || 'User')}
                              </span>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment */}
                      <div className="flex gap-2">
                        {!user && (
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder={t.yourName}
                            className={`w-24 px-3 py-2 rounded-xl text-sm ${
                              darkMode ? 'bg-gray-700 text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'
                            }`}
                          />
                        )}
                        <input
                          type="text"
                          value={newComment[listing.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [listing.id]: e.target.value }))}
                          placeholder={t.addComment}
                          className={`flex-1 px-3 py-2 rounded-xl text-sm ${
                            darkMode ? 'bg-gray-700 text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'
                          }`}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(listing.id)}
                        />
                        <button
                          onClick={() => handleAddComment(listing.id)}
                          className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        </>
        )}
      </div>

      {/* Create Listing Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className={`w-[95vw] max-w-md max-h-[75vh] overflow-y-auto p-4 sm:p-6 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle>{t.createListing}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Type Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setNewListing(prev => ({ ...prev, type: 'sell' }))}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
                  newListing.type === 'sell'
                    ? 'bg-green-500 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <TrendingUp size={18} />
                {t.sell}
              </button>
              <button
                onClick={() => setNewListing(prev => ({ ...prev, type: 'buy' }))}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
                  newListing.type === 'buy'
                    ? 'bg-blue-500 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <TrendingDown size={18} />
                {t.buy}
              </button>
            </div>

            {/* Currency */}
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.currency}</label>
              <select
                value={newListing.currency_code}
                onChange={(e) => setNewListing(prev => ({ ...prev, currency_code: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl ${
                  darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Amount & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.amount}</label>
                <input
                  type="number"
                  value={newListing.amount}
                  onChange={(e) => setNewListing(prev => ({ ...prev, amount: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                  placeholder="100"
                />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.pricePerUnit}</label>
                <input
                  type="number"
                  value={newListing.price_per_unit}
                  onChange={(e) => setNewListing(prev => ({ ...prev, price_per_unit: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                  placeholder="235"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.description}</label>
              <textarea
                value={newListing.description}
                onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl resize-none ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                }`}
                rows={2}
              />
            </div>

            {/* Payment Methods */}
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.paymentMethod}</label>
              <div className="flex flex-wrap gap-2">
                {['hand', 'ccp', 'baridimob', 'mediator'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => togglePaymentMethod(method)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      newListing.payment_methods.includes(method)
                        ? 'bg-blue-500 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {getPaymentMethodLabel(method)}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact & Wilaya */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.contactInfo}</label>
                <input
                  type="text"
                  value={newListing.contact_info}
                  onChange={(e) => setNewListing(prev => ({ ...prev, contact_info: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                  placeholder="0555..."
                />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.wilaya}</label>
                <input
                  type="text"
                  maxLength={2}
                  value={newListing.wilaya}
                  onChange={(e) => setNewListing(prev => ({ ...prev, wilaya: e.target.value.replace(/\D/g, '') }))}
                  className={`w-full px-4 py-3 rounded-xl ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                  placeholder="16"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCreateDialog(false)}
                className={`flex-1 py-3 rounded-xl font-semibold ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCreateListing}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold"
              >
                {t.post}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Listing Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className={`w-[95vw] max-w-md max-h-[75vh] overflow-y-auto p-4 sm:p-6 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle>{t.editListing}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setNewListing(prev => ({ ...prev, type: 'sell' }))}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
                  newListing.type === 'sell' ? 'bg-green-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <TrendingUp size={18} />
                {t.sell}
              </button>
              <button
                onClick={() => setNewListing(prev => ({ ...prev, type: 'buy' }))}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
                  newListing.type === 'buy' ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <TrendingDown size={18} />
                {t.buy}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.amount}</label>
                <input type="number" value={newListing.amount} onChange={(e) => setNewListing(prev => ({ ...prev, amount: e.target.value }))} className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`} />
              </div>
              <div>
                <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.pricePerUnit} ({t.dzd})</label>
                <input type="number" value={newListing.price_per_unit} onChange={(e) => setNewListing(prev => ({ ...prev, price_per_unit: e.target.value }))} className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowEditDialog(false)} className={`flex-1 py-3 rounded-xl font-semibold ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>{t.cancel}</button>
              <button onClick={handleUpdateListing} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold">{t.post}</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog - Only for logged in users */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className={`w-[95vw] max-w-md max-h-[70vh] overflow-y-auto p-4 sm:p-6 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle>{contactListing?.type === 'sell' ? t.contactSeller : t.contactBuyer}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl resize-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
            />
            <button
              onClick={handleSendContactMessage}
              disabled={!contactMessage.trim()}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white disabled:opacity-50"
            >
              {t.sendMessage}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Required Dialog - For guests trying to contact */}
      <Dialog open={showLoginRequiredDialog} onOpenChange={setShowLoginRequiredDialog}>
        <DialogContent className={`w-[90vw] max-w-sm p-4 sm:p-6 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">{t.loginRequired}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.loginRequiredDesc}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowLoginRequiredDialog(false);
                  navigate('/auth?mode=login');
                }}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
              >
                {t.loginBtn}
              </button>
              <button
                onClick={() => {
                  setShowLoginRequiredDialog(false);
                  navigate('/auth?mode=register');
                }}
                className={`w-full py-3 rounded-xl font-semibold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                {t.registerBtn}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation already rendered at top of component */}
    </div>
  );
};

export default ShopPage;
