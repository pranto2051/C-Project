'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LoadingProgressProps {
  isLoading: boolean;
  className?: string;
  onComplete?: () => void;
}

export function LoadingProgress({ isLoading, className, onComplete }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);

      // Simulate realistic loading progress
      const steps = [
        { target: 20, delay: 100 },
        { target: 45, delay: 200 },
        { target: 70, delay: 300 },
        { target: 85, delay: 400 },
        { target: 95, delay: 500 },
      ];

      let currentStep = 0;
      const intervals: NodeJS.Timeout[] = [];

      steps.forEach((step, index) => {
        const timeout = setTimeout(() => {
          if (currentStep <= index) {
            currentStep = index;
            const interval = setInterval(() => {
              setProgress(prev => {
                if (prev >= step.target) {
                  clearInterval(interval);
                  return step.target;
                }
                return prev + 1;
              });
            }, 20);
            intervals.push(interval);
          }
        }, step.delay);
        intervals.push(timeout as unknown as NodeJS.Timeout);
      });

      return () => {
        intervals.forEach(clearTimeout);
      };
    } else {
      // Complete the progress when loading finishes
      setProgress(100);
      const timeout = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, onComplete]);

  if (!visible) return null;

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-[100]', className)}>
      {/* Progress bar */}
      <div className="h-1 bg-neutral-200/50">
        <div
          className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 transition-all duration-300 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Percentage badge */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <div className={cn(
          'bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-neutral-200',
          'flex items-center gap-3 transition-all duration-300',
          progress >= 100 ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        )}>
          {/* Animated spinner */}
          <div className="relative w-5 h-5">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-neutral-200"
              />
              <circle
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${progress * 0.628} 100`}
                className="text-primary-500"
              />
            </svg>
          </div>

          {/* Percentage text */}
          <span className="text-sm font-semibold text-neutral-700 tabular-nums min-w-[3ch] text-right">
            {progress}%
          </span>

          {/* Loading text */}
          <span className="text-xs text-neutral-500 hidden sm:inline">Loading...</span>
        </div>
      </div>
    </div>
  );
}
