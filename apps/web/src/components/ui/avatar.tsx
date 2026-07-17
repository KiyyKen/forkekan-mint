import { cn } from '@/utils/cn';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

/**
 * Avatar user — foto profil Google bila ada, fallback inisial nama.
 * Selalu punya nama yang dapat diakses screen reader, karena teks nama
 * di sebelahnya bisa disembunyikan pada layar kecil (docs/09: User icon).
 */
export function Avatar({ name, avatarUrl, className }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn('size-8 shrink-0 rounded-full object-cover', className)}
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary',
        className,
      )}
    >
      {initial}
    </span>
  );
}
