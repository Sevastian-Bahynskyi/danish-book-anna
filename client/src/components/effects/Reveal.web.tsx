import type { ReactNode } from 'react';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

import FadeContent from '../reactbits/FadeContent';
import { useScroller } from '../Screen';
import { useReducedMotion } from './motion';

// ScrollTrigger measures positions once; recompute them whenever the page
// grows (content loads, explanations open) so reveals fire at the right time.
const watched = new WeakSet<HTMLElement>();
function watch(scroller: HTMLElement) {
  if (watched.has(scroller)) return;
  watched.add(scroller);
  let timer: ReturnType<typeof setTimeout>;
  new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 120);
  }).observe((scroller.firstElementChild as HTMLElement) ?? scroller);
}

// Sections fade in once as they scroll into view (React Bits FadeContent).
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const scroller = useScroller();
  const reduced = useReducedMotion();
  if (reduced || !scroller) return <>{children}</>;
  watch(scroller);
  return (
    <FadeContent container={scroller} blur duration={700} delay={delay} threshold={0.08} style={{ display: 'flex', flexDirection: 'column' }}>
      {children}
    </FadeContent>
  );
}
