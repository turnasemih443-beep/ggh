import { useState } from 'react';
import { BadgeCheck, Bookmark, Heart, MessageCircle, Repeat2, TriangleAlert } from 'lucide-react';
import { Avatar } from './Avatar';
import { FounderBadges } from './Badges';
import type { Comment, MediaResult, Post } from '@/types';
import { formatRelative } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  username: string;
  avatarUrl: string | null;
  following: boolean;
  onToggleFollow: () => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleRepost: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
}

export function PostCard({
  post,
  username,
  avatarUrl,
  following,
  onToggleFollow,
  onToggleLike,
  onToggleSave,
  onToggleRepost,
  onAddComment,
}: PostCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onAddComment(post.id, text);
    setCommentText('');
  };

  return (
    <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20">
      {post.repostOf && (
        <div className="flex items-center gap-1.5 border-b border-slate-800 bg-slate-800/50 px-4 py-1.5 text-xs font-medium text-emerald-400">
          <Repeat2 className="h-3.5 w-3.5" /> Yeniden Paylaşıldı
        </div>
      )}
      <header className="flex items-center gap-3 px-4 py-3">
        <Avatar username={username} imageUrl={avatarUrl} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-100">
            <span className="truncate">{username}</span>
            <FounderBadges />
          </p>
          <p className="text-xs text-slate-500">{formatRelative(post.createdAt)}</p>
        </div>
        {post.tag && <TagBadge tag={post.tag} className="ml-auto hidden md:inline-flex" />}
        <button
          onClick={onToggleFollow}
          className={`ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors md:ml-3 ${
            following
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-fuchsia-600 text-white hover:bg-fuchsia-500'
          }`}
        >
          {following ? 'Takip Ediliyor' : 'Takip Et'}
        </button>
      </header>

      <div className="relative aspect-square bg-slate-950" onClick={() => post.isSpoiler && setRevealed(true)}>
        <img src={post.imageUrl} alt={post.caption || 'Gönderi görseli'} className="h-full w-full object-cover" />
        {post.isSpoiler && !revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 backdrop-blur-lg transition-colors hover:bg-slate-950/70"
          >
            <TriangleAlert className="h-10 w-10 text-amber-400" />
            <span className="px-6 text-center text-base font-semibold text-slate-100">Spoiler İçerik</span>
            <span className="px-6 text-center text-sm text-slate-400">Görmek için tıkla</span>
          </button>
        )}
      </div>

      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onToggleLike(post.id)}
            aria-label="Beğen"
            className={`transition-transform active:scale-125 ${post.liked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
          >
            <Heart className={`h-6 w-6 ${post.liked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            aria-label="Yorumlar"
            className="text-slate-400 transition-colors hover:text-slate-200"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <button
            onClick={() => onToggleRepost(post.id)}
            aria-label="Yeniden paylaş"
            className={`ml-1 transition-transform active:scale-125 ${post.reposted ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'}`}
          >
            <Repeat2 className="h-6 w-6" />
          </button>
          <button
            onClick={() => onToggleSave(post.id)}
            aria-label="Kaydet"
            className={`ml-auto transition-transform active:scale-125 ${post.saved ? 'text-fuchsia-400' : 'text-slate-400 hover:text-fuchsia-300'}`}
          >
            <Bookmark className={`h-6 w-6 ${post.saved ? 'fill-current' : ''}`} />
          </button>
        </div>
        <p className="text-sm font-semibold text-slate-100">
          {post.likes} beğenme · {post.reposts} yeniden paylaşım
        </p>
        {post.caption && (
          <p className="whitespace-pre-wrap text-sm text-slate-300">
            <span className="mr-2 font-semibold text-slate-100">{username}</span>
            {post.caption}
          </p>
        )}
        {post.tag && <TagBadge tag={post.tag} className="mt-1 md:hidden" />}

        {showComments && (
          <div className="space-y-2 border-t border-slate-800 pt-3">
            {post.comments.length === 0 && (
              <p className="py-1 text-xs text-slate-500">Henüz yorum yok. İlk yorumu sen yaz!</p>
            )}
            {post.comments.map((c: Comment) => (
              <div key={c.id} className="flex items-start gap-2 text-sm">
                <Avatar username={username} imageUrl={avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                    <span className="truncate">{username}</span>
                    <FounderBadges />
                  </p>
                  <p className="break-words text-slate-300">{c.text}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-600">{formatRelative(c.createdAt)}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                placeholder="Yorum yaz..."
                className="flex-1 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-500"
              />
              <button
                onClick={submitComment}
                className="rounded-full bg-fuchsia-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-500"
              >
                Gönder
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function TagBadge({ tag, className = '' }: { tag: MediaResult; className?: string }) {
  return (
    <span
      className={`inline-flex max-w-[10rem] items-center gap-1 truncate rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2.5 py-1 text-xs font-medium text-fuchsia-300 ${className}`}
    >
      <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{tag.title}</span>
    </span>
  );
}
