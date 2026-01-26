import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  MessageCircle, Send, User, ArrowLeft, Search, 
  CheckCheck, Check, MoreVertical, Trash2, Shield
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  sender_id: string | null;
  receiver_id: string;
  sender_name: string | null;
  content: string;
  listing_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  isVerified: boolean;
  lastMessage: string;
  lastDate: string;
  unreadCount: number;
  messages: Message[];
}

interface Profile {
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { darkMode, language } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<{ [key: string]: Profile }>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    ar: {
      title: 'الرسائل',
      search: 'بحث في المحادثات...',
      noMessages: 'لا توجد رسائل بعد',
      startConversation: 'ابدأ محادثة من السوق',
      typeMessage: 'اكتب رسالة...',
      back: 'رجوع',
      deleteConversation: 'حذف المحادثة',
      deleteConfirm: 'هل تريد حذف هذه المحادثة؟',
      deleteDesc: 'سيتم حذف جميع الرسائل في هذه المحادثة',
      cancel: 'إلغاء',
      delete: 'حذف',
      you: 'أنت',
      now: 'الآن',
      loginRequired: 'يجب تسجيل الدخول',
      loginDesc: 'يجب عليك تسجيل الدخول لعرض الرسائل',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب'
    },
    en: {
      title: 'Messages',
      search: 'Search conversations...',
      noMessages: 'No messages yet',
      startConversation: 'Start a conversation from the marketplace',
      typeMessage: 'Type a message...',
      back: 'Back',
      deleteConversation: 'Delete Conversation',
      deleteConfirm: 'Delete this conversation?',
      deleteDesc: 'All messages in this conversation will be deleted',
      cancel: 'Cancel',
      delete: 'Delete',
      you: 'You',
      now: 'now',
      loginRequired: 'Login Required',
      loginDesc: 'You need to log in to view messages',
      login: 'Login',
      register: 'Register'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
    if (user) {
      fetchMessages();
      fetchProfiles();
      
      const channel = supabase
        .channel('messages-page-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          () => fetchMessages()
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${user.id}`
          },
          () => fetchMessages()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, authLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, full_name, username, avatar_url, is_verified');
    
    if (data) {
      const profileMap: { [key: string]: Profile } = {};
      data.forEach(p => {
        profileMap[p.user_id] = p;
      });
      setProfiles(profileMap);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
      .order('created_at', { ascending: true });
    
    if (data) {
      const convMap: { [key: string]: Conversation } = {};
      
      data.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : (msg.sender_id || 'unknown');
        
        if (!convMap[partnerId]) {
          convMap[partnerId] = {
            partnerId,
            partnerName: '',
            partnerAvatar: null,
            isVerified: false,
            lastMessage: msg.content,
            lastDate: msg.created_at,
            unreadCount: 0,
            messages: []
          };
        }
        convMap[partnerId].messages.push(msg);
        convMap[partnerId].lastMessage = msg.content;
        convMap[partnerId].lastDate = msg.created_at;
        
        if (!msg.is_read && msg.receiver_id === user.id) {
          convMap[partnerId].unreadCount++;
        }
      });

      // Sort conversations by last message date
      const sortedConversations = Object.values(convMap).sort(
        (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
      );
      
      setConversations(sortedConversations);
    }
  };

  const getPartnerInfo = (conv: Conversation) => {
    const partnerProfile = profiles[conv.partnerId];
    if (partnerProfile) {
      return {
        name: partnerProfile.full_name || partnerProfile.username || 'User',
        avatar: partnerProfile.avatar_url,
        isVerified: partnerProfile.is_verified
      };
    }
    // Fallback to sender_name from messages
    const partnerMessage = conv.messages.find(m => m.sender_id === conv.partnerId);
    return {
      name: partnerMessage?.sender_name || 'User',
      avatar: null,
      isVerified: false
    };
  };

  const markConversationAsRead = async (partnerId: string) => {
    if (!user) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', partnerId);
    fetchMessages();
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim() || !selectedConversation) return;
    setSending(true);
    try {
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedConversation,
        sender_name: (profile as any)?.full_name || (profile as any)?.username || 'User',
        content: newMessage.trim()
      });
      
      setNewMessage('');
      fetchMessages();
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!user || !conversationToDelete) return;
    
    await supabase
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversationToDelete}),and(sender_id.eq.${conversationToDelete},receiver_id.eq.${user.id})`);
    
    setShowDeleteDialog(false);
    setConversationToDelete(null);
    setSelectedConversation(null);
    fetchMessages();
  };

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.now;
    if (minutes < 60) return language === 'ar' ? `${minutes} د` : `${minutes}m`;
    if (hours < 24) return language === 'ar' ? `${hours} س` : `${hours}h`;
    if (days < 7) return language === 'ar' ? `${days} ي` : `${days}d`;
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US');
  };

  const formatMessageTime = (date: string) => {
    return new Date(date).toLocaleTimeString(language === 'ar' ? 'ar-DZ' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const info = getPartnerInfo(conv);
    return info.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find(c => c.partnerId === selectedConversation);

  // Not logged in view
  if (!authLoading && !user) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <MessageCircle size={64} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {t.loginRequired}
          </h2>
          <p className={`text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.loginDesc}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold"
            >
              {t.login}
            </button>
            <button
              onClick={() => navigate('/auth?mode=register')}
              className={`px-6 py-3 rounded-xl font-semibold ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {t.register}
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-md border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="px-4 py-3">
          {selectedConversation && selectedConv ? (
            // Conversation Header
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {getPartnerInfo(selectedConv).avatar ? (
                    <img 
                      src={getPartnerInfo(selectedConv).avatar!} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {getPartnerInfo(selectedConv).name}
                    </span>
                    {getPartnerInfo(selectedConv).isVerified && (
                      <Shield size={14} className="text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setConversationToDelete(selectedConversation);
                  setShowDeleteDialog(true);
                }}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ) : (
            // Main Header
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t.title}
              </h1>
              <div className={`mt-3 relative`}>
                <Search size={18} className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className={`w-full py-2.5 ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl ${
                    darkMode ? 'bg-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedConversation && selectedConv ? (
        // Messages View
        <div className="flex flex-col h-[calc(100vh-180px)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedConv.messages.map((msg, index) => {
              const isMine = msg.sender_id === user?.id;
              const showDate = index === 0 || 
                new Date(msg.created_at).toDateString() !== 
                new Date(selectedConv.messages[index - 1].created_at).toDateString();

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {new Date(msg.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                      isMine
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm'
                        : darkMode ? 'bg-gray-800 text-white rounded-bl-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className={`flex items-center gap-1 justify-end mt-1 ${
                        isMine ? 'text-blue-100' : darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <span className="text-[10px]">{formatMessageTime(msg.created_at)}</span>
                        {isMine && (
                          msg.is_read ? (
                            <CheckCheck size={14} className="text-blue-200" />
                          ) : (
                            <Check size={14} />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t.typeMessage}
                className={`flex-1 px-4 py-3 rounded-2xl ${
                  darkMode ? 'bg-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-800 placeholder-gray-400'
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Conversations List
        <div className="p-4">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MessageCircle size={48} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t.noMessages}
              </p>
              <p className={`text-center text-sm mt-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {t.startConversation}
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold"
              >
                {language === 'ar' ? 'تصفح السوق' : 'Browse Marketplace'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conv) => {
                const info = getPartnerInfo(conv);
                return (
                  <div
                    key={conv.partnerId}
                    onClick={() => {
                      setSelectedConversation(conv.partnerId);
                      markConversationAsRead(conv.partnerId);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      darkMode 
                        ? 'bg-gray-800 hover:bg-gray-750 active:bg-gray-700' 
                        : 'bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm'
                    } ${conv.unreadCount > 0 ? 'ring-2 ring-blue-500/30' : ''}`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        {info.avatar ? (
                          <img src={info.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                        )}
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} ${conv.unreadCount > 0 ? 'font-bold' : ''}`}>
                              {info.name}
                            </p>
                            {info.isVerified && (
                              <Shield size={14} className="text-blue-500" />
                            )}
                          </div>
                          <span className={`text-xs ${conv.unreadCount > 0 ? 'text-blue-500 font-semibold' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDate(conv.lastDate)}
                          </span>
                        </div>
                        <p className={`text-sm truncate mt-0.5 ${
                          conv.unreadCount > 0 
                            ? darkMode ? 'text-white font-medium' : 'text-gray-800 font-medium'
                            : darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {conv.messages[conv.messages.length - 1]?.sender_id === user?.id && (
                            <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>{t.you}: </span>
                          )}
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={`w-[90vw] max-w-sm ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? 'text-gray-400' : ''}>
              {t.deleteDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : ''}>
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-red-500 hover:bg-red-600"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNavigation />
    </div>
  );
};

export default MessagesPage;
