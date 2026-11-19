import type { Post, Profile, Social, WatchlistEntry } from '@/types';

const KEYS = {
  posts: 'anigram:posts',
  profile: 'anigram:profile',
  watchlist: 'anigram:watchlist',
  social: 'anigram:social',
} as const;

export const DEFAULT_PROFILE: Profile = {
  username: 'otaku',
  bio: 'Anime ve manga tutkunu · AniGram Kurucusu',
  avatarUrl: null,
};

export const DEFAULT_SOCIAL: Social = {
  following: false,
  followers: 0,
  followingCount: 0,
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Kota dolduğunda sessizce geç
  }
}

export function loadPosts(): Post[] {
  const posts = load<Post[]>(KEYS.posts, []);
  return posts.map((p) => ({
    ...p,
    reposts: p.reposts ?? 0,
    reposted: p.reposted ?? false,
    repostOf: p.repostOf ?? null,
  }));
}

export function savePosts(posts: Post[]): void {
  save(KEYS.posts, posts);
}

export function loadProfile(): Profile {
  return { ...DEFAULT_PROFILE, ...load<Partial<Profile>>(KEYS.profile, {}) };
}

export function saveProfile(profile: Profile): void {
  save(KEYS.profile, profile);
}

export function loadSocial(): Social {
  return { ...DEFAULT_SOCIAL, ...load<Partial<Social>>(KEYS.social, {}) };
}

export function saveSocial(social: Social): void {
  save(KEYS.social, social);
}

export function loadWatchlist(): WatchlistEntry[] {
  return load<WatchlistEntry[]>(KEYS.watchlist, []);
}

export function saveWatchlist(entries: WatchlistEntry[]): void {
  save(KEYS.watchlist, entries);
}
