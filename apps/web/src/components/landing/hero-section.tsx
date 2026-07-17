import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

const TRUST_POINTS = [
  'Upload hingga 500 MB',
  'Rekomendasi dengan alasan yang jelas',
  'Link download aman & otomatis kedaluwarsa',
];

/**
 * Hero — harus menjawab "apa ini / kenapa AI / apa CTA-nya" dalam sekali lihat
 * (docs/09: Landing Page Structure — Hero).
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
      >
        <div className="h-96 w-full max-w-3xl rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
          AI Video Optimizer
        </span>

        <h1 className="text-balance mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
          Satu upload. AI pilihkan setting terbaik untuk tiap platform.
        </h1>

        <p className="text-pretty mt-6 max-w-2xl text-lg text-muted-foreground">
          Forkekan-mint menganalisis video Anda secara menyeluruh, lalu merekomendasikan preset
          terbaik untuk WhatsApp, Instagram, TikTok, dan platform lainnya — supaya video Anda
          tetap tajam di mana pun diunggah.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link to="/upload">
            <Button size="lg">Upload Video</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Masuk dengan Google
            </Button>
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span aria-hidden="true" className="size-1 rounded-full bg-muted-foreground" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
