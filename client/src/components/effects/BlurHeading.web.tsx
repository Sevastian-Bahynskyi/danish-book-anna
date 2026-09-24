import { StyleSheet, Text, type TextStyle } from 'react-native';

import BlurText from '../reactbits/BlurText';
import { useReducedMotion } from './motion';

// The welcome headline arrives word by word, once (React Bits BlurText).
export function BlurHeading({ text, style }: { text: string; style?: TextStyle }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <Text role="heading" aria-level={1} style={style}>
        {text}
      </Text>
    );
  }
  const flat: Record<string, unknown> = { ...(StyleSheet.flatten(style) ?? {}) };
  // React Native line heights are pixels; in CSS a bare number is a multiplier.
  if (typeof flat.lineHeight === 'number') flat.lineHeight = `${flat.lineHeight}px`;
  return (
    <div role="heading" aria-level={1} aria-label={text} style={{ margin: 0 }}>
      <div aria-hidden style={{ ...(flat as object), margin: 0, display: 'block' } as React.CSSProperties}>
        <BlurText text={text} delay={90} animateBy="words" direction="top" stepDuration={0.3} className="dpa-blur" />
      </div>
    </div>
  );
}
