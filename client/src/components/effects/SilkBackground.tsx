import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

// Native: a calm solid tint instead of the WebGL silk.
export function SilkBackground({ style }: { style?: ViewStyle }) {
  const { c } = useTheme();
  return <View pointerEvents="none" style={[{ position: 'absolute', inset: 0, backgroundColor: c.accentSoft, opacity: 0.6 }, style]} />;
}
