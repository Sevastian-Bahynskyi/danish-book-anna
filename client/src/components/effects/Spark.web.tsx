import type { ReactNode } from 'react';

import ClickSpark from '../reactbits/ClickSpark';
import { useReducedMotion } from './motion';

// A small burst when a phrase is saved (React Bits ClickSpark).
export function Spark({ children, color = '#C95777' }: { children: ReactNode; color?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <ClickSpark sparkColor={color} sparkSize={8} sparkRadius={22} sparkCount={8} duration={420}>
      {children}
    </ClickSpark>
  );
}
