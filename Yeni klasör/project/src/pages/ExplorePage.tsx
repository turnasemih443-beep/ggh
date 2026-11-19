import { useMemo } from 'react';
import { ImageOff } from 'lucide-react';
import { TagBadge } from '@/components/PostCard';
import type { MediaResult, Post } from '@/types';

interface ExplorePageProps {
  posts: Post[];
  activeFilter: string | null;
  onFilterChange: (title: string | null) => void;
}

export function ExplorePage({ posts, activeFilter, onFilterChange }: ExplorePageProps) {
  const tags = useMemo(() => {
    const byTitle = new Map<string, MediaResult>();
    for (const p of posts) {
      if (p.tag && !byTitle.has(p.tag.title)) byTitle.set(p.tag.title, p.tag);
    }
    return Array.from(byTitle.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [posts]);

  const visible = activeFilter ? posts.filter((p) => p.tag?.title === activeFilter) : posts;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-slate-100">Keşfet</h1>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-16 text-center">
          <ImageOff className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-400">
            Henüz hiç gönderi yok. Paylaşılan gönderiler burada görünecek.
          </p>
        </div>
      ) : (
        <>
          {tags.length > 0 && (
            <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => onFilterChange(null)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  activeFilter === null ? 'bg-fuchsia-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Tümü
              </button>
              {tags.map((t) => (
                <button
                  key={t.title}
                  onClick={() => onFilterChange(activeFilter === t.title ? null : t.title)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeFilter === t.title ? 'bg-fuchsia-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}

          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">Bu etikete ait gönderi bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {visible.map((post) => (
                <div key={post.id} className="group relative aspect-square overflow-hidden rounded-sm bg-slate-900 sm:rounded-md">
                  <img
                    src={post.imageUrl}
                    alt={post.caption || 'Gönderi'}
                    className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${post.isSpoiler ? 'blur-md' : ''}`}
                  />
                  {post.isSpoiler && (
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-xs font-semibold text-amber-300">
                      Spoiler
                    </span>
                  )}
                  {post.tag && (
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <TagBadge tag={post.tag} className="max-w-full bg-slate-950/70" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
