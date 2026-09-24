import { useTheme } from '@/theme';

// Fades a full-bleed background into the page colour.
export function FadeEdge({ height = 120 }: { height?: number }) {
  const { c } = useTheme();
  return <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height, pointerEvents: 'none', background: `linear-gradient(to bottom, ${c.bg}00, ${c.bg})` }} />;
}
