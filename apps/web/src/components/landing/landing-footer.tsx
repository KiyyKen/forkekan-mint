import { Video } from 'lucide-react';

import { APP_NAME, APP_TAGLINE } from '@forkekan/shared';

const CURRENT_YEAR = new Date().getFullYear();

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Video aria-hidden="true" className="size-3.5" />
          </span>
          <span className="text-sm font-bold tracking-tight">{APP_NAME}</span>
        </div>
        <p className="text-pretty text-sm text-muted-foreground">{APP_TAGLINE}</p>
        <p className="text-xs text-muted-foreground">
          &copy; {CURRENT_YEAR} {APP_NAME}. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
