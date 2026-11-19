import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { searchMedia, type MediaType } from '@/lib/jikan';
import type { MediaResult } from '@/types';

interface MediaSearchProps {
  onSelect: (media: MediaResult) => void;
}

export function MediaSearch({ onSelect }: MediaSearchProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<MediaType>('anime');
  const [results, setResults] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
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
        setResults(found);
        setTouched(true);
      } catch {
        setError('Arama sırasında bir hata oluştu. Lütfen tekrar dene.');
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => window.clearTimeout(debounceRef.current);
  }, [query, type]);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-300">Anime / Manga Etiketi</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Örn: Attack on Titan"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-9 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-fuchsia-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setTouched(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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
      {!loading && !error && touched && results.length === 0 && (
        <p className="mt-3 py-2 text-center text-sm text-slate-500">Sonuç bulunamadı.</p>
      )}
      {results.length > 0 && (
        <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 p-1">
          {results.map((m) => (
            <li key={m.malId}>
              <button
                onClick={() => onSelect(m)}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-slate-700"
              >
                {m.imageUrl ? (
                  <img src={m.imageUrl} alt="" className="h-12 w-9 shrink-0 rounded object-cover" />
                ) : (
                  <div className="h-12 w-9 shrink-0 rounded bg-slate-600" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-100">{m.title}</span>
                  <span className="block text-xs text-slate-400">
                    {type === 'anime' ? 'Anime' : 'Manga'}
                    {m.year ? ` · ${m.year}` : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
