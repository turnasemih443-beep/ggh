import { useEffect, useRef, useState } from 'react';
import { Bookmark, BookOpen, Grid3X3, Heart, Pencil, Repeat2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { FounderBadges } from '@/components/Badges';
import { WatchlistPanel } from '@/components/WatchlistPanel';
import type { Post, Profile, Social, WatchlistEntry } from '@/types';

interface ProfilePageProps {
  profile: Profile;
  social: Social;
  posts: Post[];
  watchlist: WatchlistEntry[];
  onProfileSave: (profile: Profile) => void;
  onToggleFollow: () => void;
  onWatchlistAdd: (entry: WatchlistEntry) => void;
  onWatchlistRemove: (malId: number) => void;
}

type Tab = 'posts' | 'reposts' | 'liked' | 'watchlist';

export function ProfilePage({
  profile,
  social,
  posts,
  watchlist,
  onProfileSave,
  onToggleFollow,
  onWatchlistAdd,
  onWatchlistRemove,
}: ProfilePageProps) {
  const [tab, setTab] = useState<Tab>('posts');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const save = () => {
    const username = draft.username.trim() || profile.username;
    onProfileSave({ username, bio: draft.bio.trim(), avatarUrl: draft.avatarUrl });
    setEditing(false);
  };

  const pickAvatar = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, avatarUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const reposts = posts.filter((p) => p.reposted);
  const liked = posts.filter((p) => p.liked);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center gap-5 sm:gap-8">
        <Avatar username={profile.username} imageUrl={profile.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar username={draft.username} imageUrl={draft.avatarUrl} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-fuchsia-300 transition-colors hover:bg-slate-700"
                >
                  Avatarı Değiştir
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickAvatar(e.target.files?.[0])}
                />
              </div>
              <input
                value={draft.username}
                onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                placeholder="Kullanıcı adı"
                maxLength={30}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-500"
              />
              <textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                placeholder="Bio"
                rows={2}
                maxLength={160}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-fuchsia-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={save}
                  className="rounded-full bg-fuchsia-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-fuchsia-500"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="flex items-center gap-1.5 truncate text-xl font-bold text-slate-100">
                  {profile.username}
                  <FounderBadges />
                </h1>
                <button
                  onClick={startEdit}
                  aria-label="Profili düzenle"
                  className="rounded-full bg-slate-800 p-2 text-slate-400 transition-colors hover:text-fuchsia-400"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              {profile.bio && <p className="mt-1 text-sm text-slate-400">{profile.bio}</p>}
              <div className="mt-2 flex gap-4 text-sm text-slate-300">
                <span>
                  <span className="font-bold text-slate-100">{posts.length}</span> Gönderi
                </span>
                <span>
                  <span className="font-bold text-slate-100">{social.followers}</span> Takipçi
                </span>
                <span>
                  <span className="font-bold text-slate-100">{social.followingCount}</span> Takip
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {!editing && (
        <button
          onClick={onToggleFollow}
          className={`mt-5 w-full rounded-full py-2 text-sm font-bold transition-colors sm:w-auto sm:px-8 ${
            social.following
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white hover:opacity-95'
          }`}
        >
          {social.following ? 'Takip Ediliyor' : 'Takip Et'}
        </button>
      )}

      <div className="mt-6 flex border-b border-slate-800">
        <button
          onClick={() => setTab('posts')}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
            tab === 'posts' ? 'border-fuchsia-500 text-fuchsia-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Grid3X3 className="h-4 w-4" /> Gönderilerim
        </button>
        <button
          onClick={() => setTab('reposts')}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
            tab === 'reposts' ? 'border-fuchsia-500 text-fuchsia-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Repeat2 className="h-4 w-4" /> Repostlar
        </button>
        <button
          onClick={() => setTab('liked')}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
            tab === 'liked' ? 'border-fuchsia-500 text-fuchsia-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Heart className="h-4 w-4" /> Beğenilenler
        </button>
        <button
          onClick={() => setTab('watchlist')}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
            tab === 'watchlist' ? 'border-fuchsia-500 text-fuchsia-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookOpen className="h-4 w-4" /> İzleme / Okuma Listem
        </button>
      </div>

      {tab === 'posts' && (
        posts.length === 0 ? (
          <GridEmpty text={'Henüz paylaşımın yok. İlk gönderini oluşturmak için "+ Paylaş" düğmesini kullan.'} />
        ) : (
          <PostGrid posts={posts} />
        )
      )}
      {tab === 'reposts' && (
        reposts.length === 0 ? (
          <GridEmpty text="Henüz repostun yok. Ana akışta bir gönderiyi yeniden paylaş düğmesiyle repostlayabilirsin." />
        ) : (
          <PostGrid posts={reposts} />
        )
      )}
      {tab === 'liked' && (
        liked.length === 0 ? (
          <GridEmpty text="Henüz bir gönderiyi beğenmedin. Ana akışta kalp simgesine dokunarak beğendiğin gönderileri burada toplayabilirsin." />
        ) : (
          <PostGrid posts={liked} />
        )
      )}
      {tab === 'watchlist' && (
        <div className="mt-6">
          <WatchlistPanel entries={watchlist} onAdd={onWatchlistAdd} onRemove={onWatchlistRemove} />
        </div>
      )}
    </div>
  );
}

function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post) => (
        <div key={post.id} className="relative aspect-square overflow-hidden rounded-sm bg-slate-900 sm:rounded-md">
          <img
            src={post.imageUrl}
            alt={post.caption || 'Gönderi'}
            className={`h-full w-full object-cover ${post.isSpoiler ? 'blur-md' : ''}`}
          />
          {post.isSpoiler && (
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-xs font-semibold text-amber-300">
              Spoiler
            </span>
          )}
          {post.repostOf && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 p-1 text-emerald-400">
              <Repeat2 className="h-3 w-3" />
            </span>
          )}
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
            <Bookmark className="h-3 w-3" /> {post.likes}
          </span>
        </div>
      ))}
    </div>
  );
}

function GridEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-16 text-center">
      <Grid3X3 className="mx-auto mb-3 h-10 w-10 text-slate-600" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
