import { Download, Settings2, Sparkles, UploadCloud, Wand2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: UploadCloud,
    title: 'Upload',
    description: 'Tarik & lepas video Anda, maksimal 500 MB.',
  },
  {
    icon: Sparkles,
    title: 'Analisis AI',
    description: 'Kami periksa detail teknis video Anda dalam hitungan detik.',
  },
  {
    icon: Wand2,
    title: 'Rekomendasi',
    description: 'AI memberi skor kecocokan per platform, lengkap dengan alasannya.',
  },
  {
    icon: Settings2,
    title: 'Optimasi',
    description: 'Video diproses otomatis sesuai preset pilihan Anda di background.',
  },
  {
    icon: Download,
    title: 'Download',
    description: 'Unduh hasilnya lewat link aman yang kedaluwarsa otomatis.',
  },
];

/** Alur produk end-to-end (docs/09: Landing Page Structure — How It Works). */
export function HowItWorksSection() {
  return (
    <section aria-label="Cara kerja" className="border-y border-border bg-card/50">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight">Cara kerjanya</h2>
          <p className="text-pretty mt-3 text-muted-foreground">
            Lima langkah, sepenuhnya otomatis setelah Anda upload.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col items-center text-center">
              <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <step.icon aria-hidden="true" className="size-5" />
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-background text-[10px] font-bold text-foreground ring-2 ring-card">
                  {index + 1}
                </span>
              </span>
              <p className="mt-3 font-semibold">{step.title}</p>
              <p className="text-pretty mt-1 text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
