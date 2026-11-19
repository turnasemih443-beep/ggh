import { useEffect, useRef, useState } from 'react';
import { BookmarkPlus, Loader2, Search, Trash2 } from 'lucide-react';
import { searchMedia, type MediaType } from '@/lib/jikan';
import type { WatchlistEntry } from '@/types';

interface WatchlistPanelProps {
  entries: WatchlistEntry[];
  onAdd: (entry: WatchlistEntry) => void;
  onRemove: (malId: number) => void;
}

export function WatchlistPanel({ entries, onAdd, onRemove }: WatchlistPanelProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<MediaType>('anime');
  const [results, setResults] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number>();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const found = await searchMedia(q, type);
        setResults(
          found.map((m) => ({
            malId: m.malId,
            title: m.title,
            imageUrl: m.imageUrl,
            mediaType: type,
            year: m.year,
          }))
        );
      } catch {
        setError('Arama sırasında bir hata oluştu. Lütfen tekrar dene.');
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => window.clearTimeout(debounceRef.current);
  }, [query, type]);

  const isSaved = (malId: number) => entries.some((e) => e.malId === malId);

  return (
    <div className="space-y-6">
      <div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İzlemek veya okumak istediğin yapımları ara..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-fuchsia-500"
          />
        </div>
        <div className="mt-2 flex gap-2">
          {(['anime', 'manga'] as MediaType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                type === t ? 'bg-fuchsia-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {loading && (
          <div className="mt-3 flex items-center justify-center gap-2 py-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Aranıyor...
          </div>
        )}
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        {results.length > 0 && (
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 p-1">
            {results.map((m) => (
              <li key={m.malId}>
                <button
                  disabled={isSaved(m.malId)}
                  onClick={() => onAdd(m)}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors enabled:hover:bg-slate-700 disabled:opacity-50"
                >
                  {m.imageUrl ? (
                    <img src={m.imageUrl} alt="" className="h-12 w-9 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-9 shrink-0 rounded bg-slate-600" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-100">{m.title}</span>
                    <span className="block text-xs text-slate-400">
                      {m.mediaType === 'anime' ? 'Anime' : 'Manga'}
                      {m.year ? ` · ${m.year}` : ''}
                    </span>
                  </span>
                  <BookmarkPlus className="h-4 w-4 shrink-0 text-fuchsia-400" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Listem</h3>
        {entries.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-8 text-center">
            <BookmarkPlus className="mx-auto mb-2 h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-400">
              Listen henüz boş. Yukarıdan arama yaparak favori anime ve manga serilerini ekle.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {entries.map((e) => (
              <li key={e.malId} className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                {e.imageUrl ? (
                  <img src={e.imageUrl} alt={e.title} className="aspect-[2/3] w-full object-cover" />
                ) : (
                  <div className="aspect-[2/3] w-full bg-slate-800" />
                )}
                <p className="truncate px-2 py-2 text-xs font-medium text-slate-200">{e.title}</p>
                <button
                  onClick={() => onRemove(e.malId)}
                  aria-label="Listeden çıkar"
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1.5 text-rose-400 opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
