import { Text, type TextStyle } from 'react-native';

export function BlurHeading({ text, style }: { text: string; style?: TextStyle }) {
  return (
    <Text role="heading" aria-level={1} style={style}>
      {text}
    </Text>
  );
}
