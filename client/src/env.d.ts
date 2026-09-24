// React Native Web reports hover and focus in Pressable's state.
import 'react-native';
declare module 'react-native' {
  interface PressableStateCallbackType {
    hovered?: boolean;
    focused?: boolean;
  }
}
