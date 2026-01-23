import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, User, ArrowLeft } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  partnerId: string | null;
  partnerName: string;
  lastMessage: string;
  lastDate: string;
  unreadCount: number;
  messages: Message[];
}

interface MessagesPopoverProps {
  darkMode: boolean;
  language: 'ar' | 'en';
}

const MessagesPopover: React.FC<MessagesPopoverProps> = ({ darkMode, language }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
      // Subscribe to realtime updates
      const channel = supabase
        .channel('messages-changes')
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
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    
    if (data) {
      setMessages(data);
      setUnreadCount(data.filter(m => !m.is_read && m.receiver_id === user.id).length);
      
      // Group into conversations
      const convMap: { [key: string]: Conversation } = {};
      data.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const partnerKey = partnerId || msg.sender_name || 'guest';
        
        if (!convMap[partnerKey]) {
          convMap[partnerKey] = {
            partnerId,
            partnerName: msg.sender_id === user.id ? 'You' : (msg.sender_name || 'User'),
            lastMessage: msg.content,
            lastDate: msg.created_at,
            unreadCount: 0,
            messages: []
          };
        }
        convMap[partnerKey].messages.push(msg);
        if (!msg.is_read && msg.receiver_id === user.id) {
          convMap[partnerKey].unreadCount++;
        }
      });
      
      setConversations(Object.values(convMap));
    }
  };

  const markConversationAsRead = async (partnerId: string | null) => {
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
      const conv = conversations.find(c => (c.partnerId || c.partnerName) === selectedConversation);
      if (!conv) return;

      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: conv.partnerId,
        sender_name: (profile as any)?.full_name || (profile as any)?.username || 'User',
        content: newMessage.trim()
      });
      
      setNewMessage('');
      fetchMessages();
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'ar' ? 'الآن' : 'now';
    if (minutes < 60) return language === 'ar' ? `${minutes} د` : `${minutes}m`;
    if (hours < 24) return language === 'ar' ? `${hours} س` : `${hours}h`;
    return language === 'ar' ? `${days} ي` : `${days}d`;
  };

  const selectedConv = conversations.find(c => (c.partnerId || c.partnerName) === selectedConversation);

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={`relative p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          <MessageCircle size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={`w-80 p-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        align="end"
      >
        {selectedConversation && selectedConv ? (
          // Conversation View
          <div className="flex flex-col h-96">
            <div className={`p-3 border-b flex items-center gap-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={() => setSelectedConversation(null)}
                className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft size={18} />
              </button>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedConv.partnerName}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {selectedConv.messages.slice().reverse().map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.sender_id === user.id
                      ? 'bg-blue-500 text-white'
                      : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.content}
                    <div className={`text-xs mt-1 ${
                      msg.sender_id === user.id ? 'text-blue-200' : darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {formatDate(msg.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type message...'}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm ${
                    darkMode ? 'bg-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-800'
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Conversations List
          <>
            <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {language === 'ar' ? 'الرسائل' : 'Messages'}
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className={`p-6 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {language === 'ar' ? 'لا توجد رسائل' : 'No messages'}
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.partnerId || conv.partnerName}
                    onClick={() => {
                      setSelectedConversation(conv.partnerId || conv.partnerName);
                      markConversationAsRead(conv.partnerId);
                    }}
                    className={`p-3 border-b cursor-pointer transition-colors ${
                      darkMode 
                        ? `border-gray-700 hover:bg-gray-700` 
                        : `border-gray-100 hover:bg-gray-50`
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <User size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {conv.partnerName}
                          </p>
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDate(conv.lastDate)}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MessagesPopover;
