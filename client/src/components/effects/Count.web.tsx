import { Text, type TextStyle } from 'react-native';

import CountUp from '../reactbits/CountUp';
import { useReducedMotion } from './motion';

// Progress numbers count up once when they appear (React Bits CountUp).
export function Count({ to, style }: { to: number; style?: TextStyle }) {
  const reduced = useReducedMotion();
  return <Text style={style}>{reduced ? to : <CountUp to={to} duration={1.2} />}</Text>;
}
