import { forwardRef } from 'react';
import { Pressable, type PressableProps, type PressableStateCallbackType, type StyleProp, type View, type ViewStyle } from 'react-native';

// Pressable for use inside <Link asChild>. Link flattens `style`, which drops
// state functions, so hover/pressed styles go through `pressStyle` instead.
export const Tap = forwardRef<View, Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; pressStyle?: (state: PressableStateCallbackType) => StyleProp<ViewStyle> }>(
  function Tap({ style, pressStyle, ...rest }, ref) {
    return <Pressable ref={ref} {...rest} style={(state) => [style, pressStyle?.(state)]} />;
  },
);
