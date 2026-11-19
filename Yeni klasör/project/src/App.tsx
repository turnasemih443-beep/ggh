import { useCallback, useEffect, useState } from 'react';
import { TopBar, BottomNav } from '@/components/Navigation';
import { CreatePostModal } from '@/components/CreatePostModal';
import { MessagesModal } from '@/components/MessagesModal';
import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { ProfilePage } from '@/pages/ProfilePage';
import {
  loadPosts,
  loadProfile,
  loadSocial,
  loadWatchlist,
  savePosts,
  saveProfile,
  saveSocial,
  saveWatchlist,
} from '@/lib/storage';
import { uid } from '@/lib/utils';
import type { MediaResult, Post, Profile, Social, WatchlistEntry } from '@/types';

type Page = 'home' | 'explore' | 'profile';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState<Post[]>(() => loadPosts());
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [social, setSocial] = useState<Social>(() => loadSocial());
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(() => loadWatchlist());
  const [exploreFilter, setExploreFilter] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);

  useEffect(() => {
    savePosts(posts);
  }, [posts]);
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);
  useEffect(() => {
    saveSocial(social);
  }, [social]);
  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  const createPost = (data: { imageUrl: string; caption: string; tag: MediaResult | null; isSpoiler: boolean }) => {
    const post: Post = {
      id: uid(),
      imageUrl: data.imageUrl,
      caption: data.caption,
      tag: data.tag,
      isSpoiler: data.isSpoiler,
      likes: 0,
      liked: false,
      saved: false,
      reposts: 0,
      reposted: false,
      repostOf: null,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [post, ...prev]);
    setCreateOpen(false);
    setPage('home');
  };

  const toggleLike = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  }, []);

  const toggleSave = useCallback((id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
  }, []);

  const addComment = useCallback((id: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, comments: [...p.comments, { id: uid(), text, createdAt: new Date().toISOString() }] }
          : p
      )
    );
  }, []);

  const toggleRepost = useCallback((id: string) => {
    setPosts((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target || target.repostOf) return prev;

      if (target.reposted) {
        const originalId = target.repostOf;
        const nowReposted = false;
        return prev
          .filter((p) => !(p.repostOf === originalId))
          .map((p) => {
            if (p.id === originalId) {
              return {
                ...p,
                reposted: nowReposted,
                reposts: Math.max(0, p.reposts - 1),
              };
            }
            return p;
          });
      }

      const repost: Post = {
        ...target,
        id: uid(),
        liked: false,
        saved: false,
        reposted: true,
        repostOf: target.id,
        comments: [],
        createdAt: new Date().toISOString(),
      };
      return [repost, ...prev.map((p) => (p.id === target.id ? { ...p, reposted: true, reposts: p.reposts + 1 } : p))];
    });
  }, []);

  const toggleFollow = useCallback(() => {
    setSocial((prev) => ({
      ...prev,
      following: !prev.following,
      followers: prev.following ? Math.max(0, prev.followers - 1) : prev.followers + 1,
      followingCount: prev.following ? Math.max(0, prev.followingCount - 1) : prev.followingCount + 1,
    }));
  }, []);

  const goHome = () => {
    setPage('home');
    setSearch('');
  };

  const goToExplore = () => {
    setPage('explore');
    setExploreFilter(null);
    setSearch('');
  };

  const submitSearch = () => {
    if (search.trim()) {
      setPage('explore');
      setExploreFilter(null);
    }
  };

  const visiblePosts = search.trim()
    ? posts.filter(
        (p) =>
          p.caption.toLowerCase().includes(search.trim().toLowerCase()) ||
          (p.tag?.title.toLowerCase().includes(search.trim().toLowerCase()) ?? false)
      )
    : posts;

  return (
    <div className="min-h-screen bg-slate-950 pb-16 text-slate-100 sm:pb-0">
      <TopBar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={submitSearch}
        onCreate={() => setCreateOpen(true)}
        onMessages={() => setMessagesOpen(true)}
        onHome={goHome}
        onProfile={() => setPage('profile')}
      />
      <main className="sm:pb-8">
        {page === 'home' && (
          <HomePage
            posts={visiblePosts}
            username={profile.username}
            avatarUrl={profile.avatarUrl}
            following={social.following}
            onToggleFollow={toggleFollow}
            onCreate={() => setCreateOpen(true)}
            onToggleLike={toggleLike}
            onToggleSave={toggleSave}
            onToggleRepost={toggleRepost}
            onAddComment={addComment}
          />
        )}
        {page === 'explore' && (
          <ExplorePage
            posts={search.trim() ? visiblePosts : posts}
            activeFilter={exploreFilter}
            onFilterChange={setExploreFilter}
          />
        )}
        {page === 'profile' && (
          <ProfilePage
            profile={profile}
            social={social}
            posts={posts.filter((p) => !p.repostOf)}
            watchlist={watchlist}
            onProfileSave={setProfile}
            onToggleFollow={toggleFollow}
            onWatchlistAdd={(entry) =>
              setWatchlist((prev) =>
                prev.some((e) => e.malId === entry.malId) ? prev : [entry, ...prev]
              )
            }
            onWatchlistRemove={(malId) => setWatchlist((prev) => prev.filter((e) => e.malId !== malId))}
          />
        )}
      </main>
      <BottomNav
        active={page}
        onHome={goHome}
        onExplore={goToExplore}
        onCreate={() => setCreateOpen(true)}
        onMessages={() => setMessagesOpen(true)}
        onProfile={() => setPage('profile')}
      />
      {createOpen && (
        <CreatePostModal onClose={() => setCreateOpen(false)} onSubmit={createPost} />
      )}
      {messagesOpen && (
        <MessagesModal
          myProfile={{ username: profile.username, avatarUrl: profile.avatarUrl }}
          onClose={() => setMessagesOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
