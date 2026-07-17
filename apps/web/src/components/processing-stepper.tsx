import { Check, Clock, Settings2, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import type { ProcessingStatus } from '@/types/processing';
import { cn } from '@/utils/cn';

interface Stage {
  key: string;
  label: string;
  message: string;
  icon: LucideIcon;
}

/** Nilai currentStep persis dari apps/api ProcessingService.toCurrentStep — jangan diubah sepihak. */
const STAGES: Stage[] = [
  { key: 'Waiting', label: 'Menunggu', message: 'Video Anda ada dalam antrean...', icon: Clock },
  {
    key: 'Preparing',
    label: 'Persiapan',
    message: 'Menyiapkan file untuk diproses...',
    icon: Settings2,
  },
  {
    key: 'Encoding',
    label: 'Memproses',
    message: 'Video Anda sedang dioptimalkan...',
    icon: Zap,
  },
  {
    key: 'Finalizing',
    label: 'Finalisasi',
    message: 'Menyelesaikan sentuhan akhir...',
    icon: Check,
  },
];

interface ProcessingStepperProps {
  status: ProcessingStatus | undefined;
}

/**
 * Visualisasi tahap processing (docs/03: Processing Flow) — dibangun murni
 * dari field currentStep/progress/estimatedRemaining yang sudah ada,
 * tanpa mengubah polling atau kontrak API.
 */
export function ProcessingStepper({ status }: ProcessingStepperProps) {
  const currentKey = status?.currentStep ?? 'Waiting';
  const foundIndex = STAGES.findIndex((stage) => stage.key === currentKey);
  const currentIndex = foundIndex === -1 ? 0 : foundIndex;
  const activeStage = STAGES[currentIndex];

  return (
    <div>
      <ol className="flex items-start justify-between gap-1">
        {STAGES.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <li key={stage.key} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  'relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isComplete && 'border-primary bg-primary text-primary-foreground',
                  isActive && 'border-primary bg-primary/10 text-primary',
                  !isComplete && !isActive && 'border-border text-muted-foreground',
                )}
              >
                {isComplete ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <stage.icon aria-hidden="true" className="size-4" />
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -inset-1 animate-pulse rounded-full border-2 border-primary/40"
                  />
                )}
              </span>
              <span
                className={cn(
                  'text-center text-xs font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>

      <p role="status" className="text-pretty mt-6 text-center text-sm font-medium">
        {activeStage.message}
      </p>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span className="tabular-nums">{status?.progress ?? 0}%</span>
        {status?.estimatedRemaining && (
          <span className="flex items-center gap-1 tabular-nums">
            <Clock aria-hidden="true" className="size-3.5" />
            sisa {status.estimatedRemaining}
          </span>
        )}
      </div>
      <Progress value={status?.progress ?? 0} label="Progress optimasi" className="mt-2" />
    </div>
  );
}
