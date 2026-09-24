import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform, ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MAX_WIDTH, space, useTheme } from '@/theme';
import { useIsWide } from './nav';

// On web the page scrolls inside this element, not the window. Scroll-driven
// effects (React Bits FadeContent) need it as their scroller.
const ScrollerContext = createContext<HTMLElement | null>(null);
export const useScroller = () => useContext(ScrollerContext);

// In-page anchors: sections report their position, links scroll to them.
type Anchors = { set: (name: string, node: View | null) => void; go: (name: string) => void };
const AnchorContext = createContext<Anchors>({ set: () => {}, go: () => {} });
export const useAnchors = () => useContext(AnchorContext);

export function Screen({ children, hero, contentStyle }: { children: ReactNode; hero?: ReactNode; contentStyle?: ViewStyle }) {
  const { c } = useTheme();
  const wide = useIsWide();
  const insets = useSafeAreaInsets();
  const ref = useRef<ScrollView>(null);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (Platform.OS === 'web') setScroller((ref.current as unknown as { getScrollableNode?: () => HTMLElement })?.getScrollableNode?.() ?? null);
  }, []);
  const pad = wide ? space(8) : space(4);
  const nodes = useRef<Record<string, View | null>>({});
  const body = useRef<View>(null);
  const bodyTop = useRef(0);
  const anchors = useMemo<Anchors>(() => ({
    set: (name, node) => (nodes.current[name] = node),
    go: (name) => {
      const node = nodes.current[name];
      if (!node || !body.current) return;
      // Measured on demand: sections sit inside animated wrappers, so their own onLayout offsets are not page offsets.
      node.measureLayout(body.current, (_x, y) => ref.current?.scrollTo({ y: Math.max(0, bodyTop.current + y - 12), animated: true }), () => {});
    },
  }), []);
  return (
    <AnchorContext.Provider value={anchors}>
    <ScrollerContext.Provider value={scroller}>
      <ScrollView
        ref={ref}
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ paddingBottom: (wide ? space(16) : 96) + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        {hero}
        <View ref={body} onLayout={(e) => (bodyTop.current = e.nativeEvent.layout.y)} style={[{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: pad }, contentStyle]}>
          {children}
        </View>
      </ScrollView>
    </ScrollerContext.Provider>
    </AnchorContext.Provider>
  );
}

export function Section({ children, style, anchor }: { children: ReactNode; style?: ViewStyle; anchor?: string }) {
  const { set } = useAnchors();
  return (
    <View ref={anchor ? (node) => set(anchor, node) : undefined} style={[{ paddingVertical: space(6), gap: space(4) }, style]}>
      {children}
    </View>
  );
}
