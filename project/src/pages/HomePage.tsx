import { ImagePlus } from 'lucide-react';
import { PostCard } from '@/components/PostCard';
import type { Post } from '@/types';

interface HomePageProps {
  posts: Post[];
  username: string;
  avatarUrl: string | null;
  following: boolean;
  onToggleFollow: () => void;
  onCreate: () => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleRepost: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
}

export function HomePage({
  posts,
  username,
  avatarUrl,
  following,
  onToggleFollow,
  onCreate,
  onToggleLike,
  onToggleSave,
  onToggleRepost,
  onAddComment,
}: HomePageProps) {
  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600/20 to-pink-500/20">
          <ImagePlus className="h-9 w-9 text-fuchsia-400" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-slate-100">
          Henüz gönderi yok. İlk anime veya manga paylaşımını sen yap!
        </h2>
        <button
          onClick={onCreate}
          className="mt-4 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-900/30 transition-transform hover:scale-105 active:scale-95"
        >
          İlk Gönderini Paylaş
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          username={username}
          avatarUrl={avatarUrl}
          following={following}
          onToggleFollow={onToggleFollow}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          onToggleRepost={onToggleRepost}
          onAddComment={onAddComment}
        />
      ))}
    </div>
  );
}
