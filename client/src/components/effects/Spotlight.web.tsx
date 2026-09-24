import type { ReactNode } from 'react';

import SpotlightCard from '../reactbits/SpotlightCard';
import '../reactbits/SpotlightCard.css';
import { useReducedMotion } from './motion';

type Rgba = `rgba(${number}, ${number}, ${number}, ${number})`;

// Soft light follows the pointer over a card (React Bits SpotlightCard).
export function Spotlight({ children, color = 'rgba(201, 87, 119, 0.22)' }: { children: ReactNode; color?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <SpotlightCard className="dpa-spot" spotlightColor={color as Rgba}>
      {children}
    </SpotlightCard>
  );
}
