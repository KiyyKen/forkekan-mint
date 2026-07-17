import { AppHeader } from '@/components/app-header';
import { FeaturesSection } from '@/components/landing/features-section';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PlatformsSection } from '@/components/landing/platforms-section';

/** Landing page (docs/09: Landing Page Structure). */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppHeader />
      <main className="flex-1">
        <HeroSection />
        <PlatformsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
