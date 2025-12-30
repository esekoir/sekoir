import React, { useState, useEffect, useCallback } from 'react';
import { commentsApi, Comment } from '@/lib/api';
import { useAuthPHP } from '@/hooks/useAuthPHP';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Heart, Send, User, Trash2, Reply, ThumbsDown, UserCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CommentSectionProps {
  currencyCode: string;
  language: 'ar' | 'en';
}

const CommentSectionPHP: React.FC<CommentSectionProps> = ({ currencyCode, language }) => {
  const { user, isAuthenticated } = useAuthPHP();
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
    try {
      const data = await commentsApi.getByCode(currencyCode);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchUserInteractions = async () => {
    try {
      const [likesData, dislikesData] = await Promise.all([
        commentsApi.getLikes(isAuthenticated ? undefined : guestId),
        commentsApi.getDislikes(isAuthenticated ? undefined : guestId)
      ]);

      if (likesData.likes) {
        setLikedComments(new Set(likesData.likes.map((l: any) => l.comment_id)));
      }
      if (dislikesData.dislikes) {
        setDislikedComments(new Set(dislikesData.dislikes.map((d: any) => d.comment_id)));
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
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
    
    try {
      await commentsApi.create({
        currency_code: currencyCode,
        content: content.trim(),
        is_guest: !isAuthenticated,
        guest_name: isAuthenticated ? undefined : name.trim(),
        parent_id: parentId
      });

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
    } catch (error) {
      toast({
        title: language === 'ar' ? 'حدث خطأ' : 'Error occurred',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const handleLike = async (commentId: string) => {
    try {
      await commentsApi.like(commentId, isAuthenticated ? undefined : guestId);
      fetchComments();
      fetchUserInteractions();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDislike = async (commentId: string) => {
    try {
      await commentsApi.dislike(commentId, isAuthenticated ? undefined : guestId);
      fetchComments();
      fetchUserInteractions();
    } catch (error) {
      console.error('Error disliking comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      fetchComments();
      toast({
        title: language === 'ar' ? 'تم حذف التعليق' : 'Comment deleted'
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ في الحذف' : 'Delete error',
        variant: 'destructive'
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
          <button
            onClick={() => handleLike(comment.id)}
            className={`flex items-center gap-1 text-sm transition-colors px-2 py-1 rounded ${
              likedComments.has(comment.id)
                ? 'text-green-500 bg-green-500/10'
                : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
            <span>{comment.likes_count}</span>
          </button>
          
          <button
            onClick={() => handleDislike(comment.id)}
            className={`flex items-center gap-1 text-sm transition-colors px-2 py-1 rounded ${
              dislikedComments.has(comment.id)
                ? 'text-red-500 bg-red-500/10'
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${dislikedComments.has(comment.id) ? 'fill-current' : ''}`} />
            <span>{comment.dislikes_count}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-primary/10"
            >
              <Reply className="w-4 h-4" />
            </button>
          )}

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
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t.send}</span>
              </button>
            </div>
          </form>

          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">{t.noComments}</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => renderComment(comment))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSectionPHP;
