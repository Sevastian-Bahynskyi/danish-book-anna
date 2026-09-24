import { Text, type TextStyle } from 'react-native';

export function Count({ to, style }: { to: number; style?: TextStyle }) {
  return <Text style={style}>{to}</Text>;
}
