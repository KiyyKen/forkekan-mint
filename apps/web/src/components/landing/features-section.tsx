import { History, LayoutGrid, Sparkles, ShieldCheck, UploadCloud, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { usePresets } from '@/hooks/use-presets';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Fitur nyata yang sudah berjalan di produk — bukan roadmap/janji. */
function getFeatures(presetCount: number | undefined): Feature[] {
  return [
    {
      icon: Sparkles,
      title: 'Rekomendasi AI',
      description:
        'Skor kecocokan dari lebih dari 7 faktor video, lengkap dengan alasannya — bukan tebakan.',
    },
    {
      icon: Zap,
      title: 'Proses Cepat',
      description:
        'Optimasi berjalan di background, jadi Anda bisa lanjut upload video lain tanpa menunggu.',
    },
    {
      icon: LayoutGrid,
      title: 'Preset Multi-Platform',
      description: presetCount
        ? `${presetCount} preset siap pakai untuk WhatsApp, Instagram, TikTok, Discord, dan lainnya.`
        : 'Preset siap pakai untuk WhatsApp, Instagram, TikTok, Discord, dan lainnya.',
    },
    {
      icon: ShieldCheck,
      title: 'Download Aman',
      description: 'Link download berlaku 5 menit, lalu kedaluwarsa otomatis untuk keamanan Anda.',
    },
    {
      icon: UploadCloud,
      title: 'Upload hingga 500 MB',
      description: 'Mendukung format MP4, MOV, AVI, MKV, dan WEBM.',
    },
    {
      icon: History,
      title: 'Riwayat Tersimpan',
      description: 'Semua hasil optimasi tersimpan — unduh ulang kapan saja tanpa proses ulang.',
    },
  ];
}

export function FeaturesSection() {
  const presets = usePresets();
  const features = getFeatures(presets.data?.length);

  return (
    <section aria-label="Fitur unggulan" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight">
          Semua yang dibutuhkan untuk video yang siap tayang
        </h2>
        <p className="text-pretty mt-3 text-muted-foreground">
          Dari analisis sampai download, semua langkah berjalan otomatis — hasilnya siap pakai
          sejak upload pertama.
        </p>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <li
            key={feature.title}
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <feature.icon aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 font-semibold">{feature.title}</h3>
            <p className="text-pretty mt-1.5 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
