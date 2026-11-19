export interface MediaResult {
  malId: number;
  title: string;
  imageUrl: string;
  year?: number;
  type?: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  tag: MediaResult | null;
  isSpoiler: boolean;
  likes: number;
  liked: boolean;
  saved: boolean;
  reposts: number;
  reposted: boolean;
  repostOf: string | null;
  comments: Comment[];
  createdAt: string;
}

export interface Profile {
  username: string;
  bio: string;
  avatarUrl: string | null;
}

export interface Social {
  following: boolean;
  followers: number;
  followingCount: number;
}

export interface WatchlistEntry {
  malId: number;
  title: string;
  imageUrl: string;
  mediaType: 'anime' | 'manga';
  year?: number;
}
