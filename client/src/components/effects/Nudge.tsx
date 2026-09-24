import type { ReactNode } from 'react';

// Native: the pointer stays still.
export function Nudge({ children }: { children: ReactNode; dir: 'up' | 'down' }) {
  return <>{children}</>;
}
