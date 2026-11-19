interface AvatarProps {
  username: string;
  imageUrl?: string | null;
  size?: 'sm' | 'lg';
}

export function Avatar({ username, imageUrl, size = 'sm' }: AvatarProps) {
  const dimension = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-9 w-9 text-sm';
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={username}
        className={`${dimension} shrink-0 rounded-full border border-slate-700 object-cover`}
      />
    );
  }
  const initial = (username.trim()[0] ?? '?').toUpperCase();
  return (
    <div
      className={`${dimension} flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 font-bold text-white`}
    >
      {initial}
    </div>
  );
}
