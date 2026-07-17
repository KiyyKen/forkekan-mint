import { Check, Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/hooks/use-theme';
import type { Theme } from '@/stores/theme-store';
import { cn } from '@/utils/cn';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: LucideIcon;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'system', label: 'Sistem', icon: Monitor },
];

const TRIGGER_ICON: Record<Theme, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/**
 * Pemilih tema (Terang/Gelap/Sistem) — dropdown icon button di header,
 * dipasang di seluruh halaman lewat AppHeader (docs/09: Header). "Sistem"
 * mengikuti preferensi OS secara realtime lewat useTheme.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const TriggerIcon = TRIGGER_ICON[theme];

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Ubah tema"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <TriggerIcon aria-hidden="true" className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Pilihan tema"
          className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {THEME_OPTIONS.map((option) => {
            const isSelected = option.value === theme;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                <option.icon aria-hidden="true" className="size-4" />
                <span className="flex-1 text-left">{option.label}</span>
                {isSelected && <Check aria-hidden="true" className="size-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
