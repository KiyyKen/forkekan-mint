import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

/** CTA penutup — mengulang aksi utama sebelum footer, tanpa perlu scroll ke atas. */
export function FinalCtaSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-20 text-center">
      <h2 className="text-balance text-3xl font-bold tracking-tight">
        Video Anda siap tayang, mulai sekarang.
      </h2>
      <p className="text-pretty mt-3 text-muted-foreground">
        Tanpa install, tanpa kartu kredit — upload video pertama Anda dan lihat rekomendasinya.
      </p>
      <div className="mt-8">
        <Link to="/upload">
          <Button size="lg">Upload Video</Button>
        </Link>
      </div>
    </section>
  );
}
