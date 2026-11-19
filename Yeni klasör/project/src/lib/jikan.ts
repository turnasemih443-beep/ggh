import type { MediaResult } from '@/types';

export type MediaType = 'anime' | 'manga';

interface JikanEntry {
  mal_id: number;
  title: string;
  images?: { jpg?: { image_url?: string } };
  year?: number;
  type?: string;
  published?: { prop?: { from?: { year?: number } } };
}

export async function searchMedia(query: string, type: MediaType): Promise<MediaResult[]> {  const res = await fetch(
    `https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}&limit=8&sfw=true`
  );
  if (!res.ok) throw new Error('Arama başarısız oldu');
  const data: { data?: JikanEntry[] } = await res.json();
  return (data.data ?? []).map((entry) => ({
    malId: entry.mal_id,
    title: entry.title,
    imageUrl: entry.images?.jpg?.image_url ?? '',
    year: entry.year ?? entry.published?.prop?.from?.year,
    type: entry.type,
  }));
}
