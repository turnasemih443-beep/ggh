import { BadgeCheck } from 'lucide-react';

export function VerifiedBadge() {
  return (
    <BadgeCheck
      aria-label="Doğrulanmış hesap"
      className="h-4 w-4 shrink-0 fill-sky-500 text-slate-950"
    />
  );
}

export function FounderBadge() {
  return (
    <span className="shrink-0 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm shadow-fuchsia-900/40">
      Kurucu
    </span>
  );
}

export function FounderBadges() {
  return (
    <span className="inline-flex items-center gap-1">
      <VerifiedBadge />
      <FounderBadge />
    </span>
  );
}
