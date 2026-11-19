interface AniGramLogoProps {
  className?: string;
}

export function AniGramLogo({ className = 'h-7' }: AniGramLogoProps) {
  return (
    <span className={`font-bold tracking-tight ${className} inline-flex items-center text-lg leading-none`}>
      <span className="bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent">Ani</span>
      <span className="text-slate-100">Gram</span>
    </span>
  );
}
