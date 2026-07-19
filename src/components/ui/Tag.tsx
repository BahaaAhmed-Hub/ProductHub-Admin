import clsx from 'clsx';
import type { ReactNode } from 'react';

export type TagTone = 'success' | 'warning' | 'danger' | 'accent' | 'neutral';

const TONES: Record<TagTone, string> = {
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  danger: 'bg-danger-bg text-danger',
  accent: 'bg-accent-bg text-navy',
  neutral: 'bg-neutralChip-bg text-neutralChip-text',
};

export function Tag({ tone = 'neutral', children }: { tone?: TagTone; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center justify-self-start w-fit h-5 px-2.5 rounded-full text-[10px] font-medium', TONES[tone])}>
      {children}
    </span>
  );
}
