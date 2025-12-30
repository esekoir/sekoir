import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Heart, Send, User, LogIn, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Comment {
  id: string;
  user_id: string;
  currency_code: string;
  content: string;
  likes_count: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  currencyCode: string;
  language: 'ar' | 'en';
}

const CommentSection: React.FC<CommentSectionProps> = ({ currencyCode, language }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      fetchComments();
      if (user) {
        fetchUserLikes();
      }
    }
  }, [currencyCode, isExpanded, user]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles!comments_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('currency_code', currencyCode)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setComments(data.map(c => ({
        ...c,
        profile: Array.isArray(c.profile) ? c.profile[0] : c.profile
      })));
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', user.id);

    if (data) {
      setLikedComments(new Set(data.map(l => l.comment_id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      currency_code: currencyCode,
      content: newComment.trim()
    });

    if (error) {
      toast({
        title: language === 'ar' ? 'حدث خطأ' : 'Error occurred',
        variant: 'destructive'
      });
    } else {
      setNewComment('');
      fetchComments();
      toast({
        title: language === 'ar' ? 'تم إضافة التعليق' : 'Comment added'
      });
    }
    setLoading(false);
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: language === 'ar' ? 'يجب تسجيل الدخول' : 'Login required',
        variant: 'destructive'
      });
      return;
    }

    const isLiked = likedComments.has(commentId);

    if (isLiked) {
      await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('comment_id', commentId);
      
      setLikedComments(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    } else {
      await supabase.from('comment_likes').insert({
        user_id: user.id,
        comment_id: commentId
      });
      
      setLikedComments(prev => new Set(prev).add(commentId));
    }

    fetchComments();
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      fetchComments();
      toast({
        title: language === 'ar' ? 'تم حذف التعليق' : 'Comment deleted'
      });
    }
  };

  const t = {
    comments: language === 'ar' ? 'التعليقات' : 'Comments',
    writeComment: language === 'ar' ? 'اكتب تعليقاً...' : 'Write a comment...',
    loginToComment: language === 'ar' ? 'سجل الدخول للتعليق' : 'Login to comment',
    noComments: language === 'ar' ? 'لا توجد تعليقات بعد' : 'No comments yet',
    send: language === 'ar' ? 'إرسال' : 'Send'
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{t.comments} ({comments.length})</span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t.writeComment}
                className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <LogIn className="w-4 h-4" />
              <a href="/auth" className="text-primary hover:underline">{t.loginToComment}</a>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t.noComments}</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {comment.profile?.avatar_url ? (
                        <img
                          src={comment.profile.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {comment.profile?.full_name || (language === 'ar' ? 'مستخدم' : 'User')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: language === 'ar' ? ar : undefined
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          likedComments.has(comment.id)
                            ? 'text-red-500'
                            : 'text-muted-foreground hover:text-red-500'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${likedComments.has(comment.id) ? 'fill-current' : ''}`}
                        />
                        <span>{comment.likes_count}</span>
                      </button>
                      {user?.id === comment.user_id && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
