import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Heart, Send, User, Trash2, Reply, ThumbsDown, UserCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Comment {
  id: string;
  user_id: string | null;
  currency_code: string;
  content: string;
  likes_count: number;
  dislikes_count: number;
  created_at: string;
  is_guest: boolean;
  guest_name: string | null;
  parent_id: string | null;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
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
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [dislikedComments, setDislikedComments] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyGuestName, setReplyGuestName] = useState('');
  const [guestId] = useState(() => {
    const stored = localStorage.getItem('guest_comment_id');
    if (stored) return stored;
    const newId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_comment_id', newId);
    return newId;
  });

  useEffect(() => {
    if (isExpanded) {
      fetchComments();
      fetchUserInteractions();
    }
  }, [currencyCode, isExpanded, user]);

  const fetchComments = async () => {
    // Fetch main comments
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('currency_code', currencyCode)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      // Get all unique user_ids
      const userIds = data.filter(c => c.user_id).map(c => c.user_id);
      
      // Fetch profiles for those users
      let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        
        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
            return acc;
          }, {} as Record<string, { full_name: string | null; avatar_url: string | null }>);
        }
      }

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select('*')
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          // Get reply user_ids
          const replyUserIds = (replies || []).filter(r => r.user_id).map(r => r.user_id);
          let replyProfilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
          
          if (replyUserIds.length > 0) {
            const { data: replyProfiles } = await supabase
              .from('profiles')
              .select('user_id, full_name, avatar_url')
              .in('user_id', replyUserIds);
            
            if (replyProfiles) {
              replyProfilesMap = replyProfiles.reduce((acc, p) => {
                acc[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
                return acc;
              }, {} as Record<string, { full_name: string | null; avatar_url: string | null }>);
            }
          }

          return {
            ...comment,
            profile: comment.user_id ? profilesMap[comment.user_id] : undefined,
            replies: (replies || []).map((r: any) => ({
              ...r,
              profile: r.user_id ? replyProfilesMap[r.user_id] : undefined
            }))
          };
        })
      );

      setComments(commentsWithReplies);
    }
  };

  const fetchUserInteractions = async () => {
    if (user) {
      const [likesRes, dislikesRes] = await Promise.all([
        supabase.from('comment_likes').select('comment_id').eq('user_id', user.id),
        supabase.from('comment_dislikes').select('comment_id').eq('user_id', user.id)
      ]);

      if (likesRes.data) setLikedComments(new Set(likesRes.data.map(l => l.comment_id)));
      if (dislikesRes.data) setDislikedComments(new Set(dislikesRes.data.map(d => d.comment_id)));
    } else {
      const [likesRes, dislikesRes] = await Promise.all([
        supabase.from('comment_likes').select('comment_id').eq('guest_id', guestId),
        supabase.from('comment_dislikes').select('comment_id').eq('guest_id', guestId)
      ]);

      if (likesRes.data) setLikedComments(new Set(likesRes.data.map(l => l.comment_id)));
      if (dislikesRes.data) setDislikedComments(new Set(dislikesRes.data.map(d => d.comment_id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    
    const content = parentId ? replyContent : newComment;
    const name = parentId ? replyGuestName : guestName;
    
    if (!content.trim()) return;
    
    if (!isAuthenticated && !name.trim()) {
      toast({
        title: language === 'ar' ? 'أدخل اسمك المستعار' : 'Enter your nickname',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    const commentData = isAuthenticated
      ? {
          user_id: user!.id,
          currency_code: currencyCode,
          content: content.trim(),
          is_guest: false,
          parent_id: parentId
        }
      : {
          currency_code: currencyCode,
          content: content.trim(),
          is_guest: true,
          guest_name: name.trim(),
          parent_id: parentId
        };

    const { error } = await supabase.from('comments').insert(commentData);

    if (error) {
      toast({
        title: language === 'ar' ? 'حدث خطأ' : 'Error occurred',
        variant: 'destructive'
      });
    } else {
      if (parentId) {
        setReplyContent('');
        setReplyGuestName('');
        setReplyingTo(null);
      } else {
        setNewComment('');
        if (!isAuthenticated) setGuestName('');
      }
      fetchComments();
      toast({
        title: language === 'ar' ? 'تم إضافة التعليق' : 'Comment added'
      });
    }
    setLoading(false);
  };

  const handleLike = async (commentId: string) => {
    const isLiked = likedComments.has(commentId);
    const isDisliked = dislikedComments.has(commentId);

    // Remove dislike if exists
    if (isDisliked) {
      if (user) {
        await supabase.from('comment_dislikes').delete().eq('user_id', user.id).eq('comment_id', commentId);
      } else {
        await supabase.from('comment_dislikes').delete().eq('guest_id', guestId).eq('comment_id', commentId);
      }
      setDislikedComments(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }

    if (isLiked) {
      if (user) {
        await supabase.from('comment_likes').delete().eq('user_id', user.id).eq('comment_id', commentId);
      } else {
        await supabase.from('comment_likes').delete().eq('guest_id', guestId).eq('comment_id', commentId);
      }
      setLikedComments(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    } else {
      const likeData = user 
        ? { user_id: user.id, comment_id: commentId }
        : { guest_id: guestId, comment_id: commentId };
      
      await supabase.from('comment_likes').insert(likeData);
      setLikedComments(prev => new Set(prev).add(commentId));
    }

    fetchComments();
  };

  const handleDislike = async (commentId: string) => {
    const isLiked = likedComments.has(commentId);
    const isDisliked = dislikedComments.has(commentId);

    // Remove like if exists
    if (isLiked) {
      if (user) {
        await supabase.from('comment_likes').delete().eq('user_id', user.id).eq('comment_id', commentId);
      } else {
        await supabase.from('comment_likes').delete().eq('guest_id', guestId).eq('comment_id', commentId);
      }
      setLikedComments(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }

    if (isDisliked) {
      if (user) {
        await supabase.from('comment_dislikes').delete().eq('user_id', user.id).eq('comment_id', commentId);
      } else {
        await supabase.from('comment_dislikes').delete().eq('guest_id', guestId).eq('comment_id', commentId);
      }
      setDislikedComments(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    } else {
      const dislikeData = user 
        ? { user_id: user.id, comment_id: commentId }
        : { guest_id: guestId, comment_id: commentId };
      
      await supabase.from('comment_dislikes').insert(dislikeData);
      setDislikedComments(prev => new Set(prev).add(commentId));
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
    guestName: language === 'ar' ? 'اسمك المستعار' : 'Your nickname',
    noComments: language === 'ar' ? 'لا توجد تعليقات بعد' : 'No comments yet',
    send: language === 'ar' ? 'إرسال' : 'Send',
    reply: language === 'ar' ? 'رد' : 'Reply',
    guest: language === 'ar' ? 'زائر' : 'Guest',
    writeReply: language === 'ar' ? 'اكتب رداً...' : 'Write a reply...'
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`bg-muted/30 rounded-lg p-3 ${isReply ? 'mr-6 rtl:mr-0 rtl:ml-6 border-r-2 rtl:border-r-0 rtl:border-l-2 border-primary/30' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {comment.is_guest ? (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : comment.profile?.avatar_url ? (
            <img
              src={comment.profile.avatar_url}
              alt=""
              className="w-8 h-8 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {comment.is_guest 
                  ? comment.guest_name 
                  : (comment.profile?.full_name || (language === 'ar' ? 'مستخدم' : 'User'))}
              </p>
              {comment.is_guest && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {t.guest}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: language === 'ar' ? ar : undefined
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Like Button */}
          <button
            onClick={() => handleLike(comment.id)}
            className={`flex items-center gap-1 text-sm transition-colors px-2 py-1 rounded ${
              likedComments.has(comment.id)
                ? 'text-green-500 bg-green-500/10'
                : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${likedComments.has(comment.id) ? 'fill-current' : ''}`}
            />
            <span>{comment.likes_count}</span>
          </button>
          
          {/* Dislike Button */}
          <button
            onClick={() => handleDislike(comment.id)}
            className={`flex items-center gap-1 text-sm transition-colors px-2 py-1 rounded ${
              dislikedComments.has(comment.id)
                ? 'text-red-500 bg-red-500/10'
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <ThumbsDown
              className={`w-4 h-4 ${dislikedComments.has(comment.id) ? 'fill-current' : ''}`}
            />
            <span>{comment.dislikes_count}</span>
          </button>

          {/* Reply Button */}
          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-primary/10"
            >
              <Reply className="w-4 h-4" />
            </button>
          )}

          {/* Delete Button */}
          {user?.id === comment.user_id && !comment.is_guest && (
            <button
              onClick={() => handleDelete(comment.id)}
              className="text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-foreground">{comment.content}</p>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 space-y-2">
          {!isAuthenticated && (
            <input
              type="text"
              value={replyGuestName}
              onChange={(e) => setReplyGuestName(e.target.value)}
              placeholder={t.guestName}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground"
              maxLength={50}
            />
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t.writeReply}
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading || !replyContent.trim()}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

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
          <form onSubmit={(e) => handleSubmit(e, null)} className="space-y-2">
            {!isAuthenticated && (
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={t.guestName}
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={50}
              />
            )}
            <div className="flex gap-2">
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
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t.noComments}</p>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
