import { Suspense, lazy, useState } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { useReducedMotion } from './motion';

// three.js is large, so the silk is loaded only when a screen shows it.
const Silk = lazy(() => import('../reactbits/Silk'));

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// Soft moving silk behind the hero and the sign-in card (React Bits Silk).
export function SilkBackground({ style }: { style?: ViewStyle }) {
  const { c, dark } = useTheme();
  const reduced = useReducedMotion();
  const [gl] = useState(() => typeof document !== 'undefined' && webglAvailable());
  return (
    <View pointerEvents="none" aria-hidden style={[{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: c.accentSoft }, style]}>
      {gl && (
        <Suspense fallback={null}>
          <div style={{ position: 'absolute', inset: 0, opacity: dark ? 0.45 : 0.45 }}>
            <Silk speed={reduced ? 0 : 3} scale={1.1} color={c.silk} noiseIntensity={0.8} rotation={0.3} lightMode={!dark} />
          </div>
        </Suspense>
      )}
    </View>
  );
}
