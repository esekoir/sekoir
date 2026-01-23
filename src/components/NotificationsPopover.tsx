import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bell, CheckCircle, Shield, DollarSign, MessageSquare, Trash2, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  type: string;
  title_ar: string;
  title_en: string;
  message_ar: string | null;
  message_en: string | null;
  is_read: boolean;
  created_at: string;
  data: any;
}

interface NotificationsPopoverProps {
  darkMode: boolean;
  language: 'ar' | 'en';
}

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ darkMode, language }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Subscribe to realtime updates
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchNotifications()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'verification': return <Shield className="text-blue-500" size={18} />;
      case 'balance': return <DollarSign className="text-green-500" size={18} />;
      case 'comment': return <MessageSquare className="text-purple-500" size={18} />;
      case 'listing_deleted': return <Trash2 className="text-red-500" size={18} />;
      default: return <Bell className="text-gray-500" size={18} />;
    }
  };

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'ar' ? 'الآن' : 'now';
    if (minutes < 60) return language === 'ar' ? `${minutes} دقيقة` : `${minutes}m`;
    if (hours < 24) return language === 'ar' ? `${hours} ساعة` : `${hours}h`;
    return language === 'ar' ? `${days} يوم` : `${days}d`;
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={`relative p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          <Bell size={20} />
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
        <div className={`p-3 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {language === 'ar' ? 'الإشعارات' : 'Notifications'}
          </h3>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-blue-500 hover:underline"
            >
              {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className={`p-6 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={`p-3 border-b cursor-pointer transition-colors ${
                  darkMode 
                    ? `border-gray-700 ${notification.is_read ? 'bg-gray-800' : 'bg-gray-700/50'}` 
                    : `border-gray-100 ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`
                } hover:opacity-80`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {language === 'ar' ? notification.title_ar : notification.title_en}
                    </p>
                    {(notification.message_ar || notification.message_en) && (
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'ar' ? notification.message_ar : notification.message_en}
                      </p>
                    )}
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
