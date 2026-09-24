import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useReducedMotion } from './motion';

// A slow bounce that points at a browser button outside the page (install guide).
export function Nudge({ children, dir }: { children: ReactNode; dir: 'up' | 'down' }) {
  const reduced = useReducedMotion();
  const d = dir === 'down' ? 10 : -10;
  const style = reduced
    ? undefined
    : ({
        animationKeyframes: [{ '0%': { transform: 'translateY(0px)' }, '50%': { transform: `translateY(${d}px)` }, '100%': { transform: 'translateY(0px)' } }],
        animationDuration: '1.4s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
      } as unknown as ViewStyle);
  return <View style={style}>{children}</View>;
}
