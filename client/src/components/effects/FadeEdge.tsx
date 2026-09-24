import { View } from 'react-native';

import { useTheme } from '@/theme';

// Native: a short solid band; web draws a real gradient.
export function FadeEdge({ height = 120 }: { height?: number }) {
  const { c } = useTheme();
  return <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: height / 4, backgroundColor: c.bg, opacity: 0.6 }} />;
}
