import { Home, MessageCircle, Search, PlusCircle, User } from 'lucide-react';
import { AniGramLogo } from './AniGramLogo';

interface TopBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onCreate: () => void;
  onMessages: () => void;
  onHome: () => void;
  onProfile: () => void;
}

export function TopBar({ search, onSearchChange, onSearchSubmit, onCreate, onMessages, onHome, onProfile }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <button onClick={onHome} className="shrink-0 transition-opacity hover:opacity-80">
          <AniGramLogo />
        </button>
        <div className="relative mx-auto hidden w-full max-w-xs sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            placeholder="Anime, manga veya gönderi ara..."
            className="w-full rounded-full border border-slate-700 bg-slate-800 py-1.5 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-fuchsia-500"
          />
        </div>
        <button
          onClick={onCreate}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-900/30 transition-transform hover:scale-105 active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          Paylaş
        </button>
        <button onClick={onMessages} aria-label="Mesajlar" className="hidden shrink-0 sm:block">
          <MessageCircle className="h-5 w-5 text-slate-300 transition-colors hover:text-fuchsia-400" />
        </button>
        <button onClick={onProfile} aria-label="Profil" className="hidden shrink-0 sm:block">
          <User className="h-5 w-5 text-slate-300 transition-colors hover:text-fuchsia-400" />
        </button>
      </div>
    </header>
  );
}

export function BottomNav({
  active,
  onHome,
  onExplore,
  onCreate,
  onMessages,
  onProfile,
}: {
  active: string;
  onHome: () => void;
  onExplore: () => void;
  onCreate: () => void;
  onMessages: () => void;
  onProfile: () => void;
}) {
  const items = [
    { id: 'home', icon: Home, label: 'Ana Akış', action: onHome },
    { id: 'explore', icon: Search, label: 'Keşfet', action: onExplore },
    { id: 'create', icon: PlusCircle, label: 'Oluştur', action: onCreate },
    { id: 'messages', icon: MessageCircle, label: 'Mesajlar', action: onMessages },
    { id: 'profile', icon: User, label: 'Profil', action: onProfile },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur sm:hidden">
      <div className="flex h-14 items-center justify-around">
        {items.map(({ id, icon: Icon, label, action }) => (
          <button
            key={id}
            onClick={action}
            aria-label={label}
            className={`flex flex-col items-center gap-0.5 px-3 transition-colors ${
              active === id ? 'text-fuchsia-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
