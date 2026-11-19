import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { MediaSearch } from './MediaSearch';
import { fileToDataUrl } from '@/lib/utils';
import type { MediaResult } from '@/types';

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (data: { imageUrl: string; caption: string; tag: MediaResult | null; isSpoiler: boolean }) => void;
}

export function CreatePostModal({ onClose, onSubmit }: CreatePostModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState<MediaResult | null>(null);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setImageUrl(dataUrl);
    } catch {
      // Bozuk dosya seçilirse önizleme gösterme
    }
  };

  const submit = () => {
    if (!imageUrl || submitting) return;
    setSubmitting(true);
    onSubmit({ imageUrl, caption: caption.trim(), tag, isSpoiler });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Yeni Gönderi</h2>
          <button onClick={onClose} aria-label="Kapat" className="text-slate-400 transition-colors hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        {imageUrl ? (
          <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-700">
            <img src={imageUrl} alt="Önizleme" className="max-h-72 w-full object-contain" />
            <button
              onClick={() => setImageUrl(null)}
              aria-label="Görseli kaldır"
              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition-colors hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 transition-colors hover:border-fuchsia-500 hover:text-fuchsia-400"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm font-medium">Görsel Yükle</span>
          </button>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Açıklama yaz..."
          rows={3}
          className="mb-4 w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-fuchsia-500"
        />

        <div className="mb-4">
          <MediaSearch onSelect={setTag} />
          {tag && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2">
              <span className="truncate text-sm font-medium text-fuchsia-300">{tag.title}</span>
              <button onClick={() => setTag(null)} aria-label="Etiketi kaldır" className="text-fuchsia-400 hover:text-fuchsia-200">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <label className="mb-5 flex cursor-pointer items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5">
          <span className="text-sm font-medium text-slate-200">Spoiler olarak işaretle</span>
          <button
            role="switch"
            aria-checked={isSpoiler}
            onClick={() => setIsSpoiler((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${isSpoiler ? 'bg-fuchsia-600' : 'bg-slate-600'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isSpoiler ? 'translate-x-[1.375rem]' : 'translate-x-0.5'}`}
            />
          </button>
        </label>

        <button
          onClick={submit}
          disabled={!imageUrl || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-900/30 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Paylaş
        </button>
      </div>
    </div>
  );
}
