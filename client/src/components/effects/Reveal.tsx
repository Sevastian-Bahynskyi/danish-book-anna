import type { ReactNode } from 'react';

// Native: content appears without a scroll-triggered fade.
export function Reveal({ children }: { children: ReactNode; delay?: number }) {
  return <>{children}</>;
}
