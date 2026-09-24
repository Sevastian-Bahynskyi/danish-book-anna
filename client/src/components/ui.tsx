import type { ComponentType, ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View, type PressableProps, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';

import { fonts, radius, space, useTheme } from '@/theme';

type IconProps = { size?: number; color?: string; weight?: 'regular' | 'bold' | 'fill' | 'duotone' | 'light' | 'thin' };
export type Icon = ComponentType<IconProps>;

// ---------------------------------------------------------------- text
type TP = { children: ReactNode; style?: TextStyle | TextStyle[]; numberOfLines?: number; selectable?: boolean };

export function Body({ children, style, ...rest }: TP) {
  const { c } = useTheme();
  return (
    <Text style={[{ fontFamily: fonts.regular, fontSize: 17, lineHeight: 26, color: c.ink }, style as TextStyle]} {...rest}>
      {children}
    </Text>
  );
}
export function Muted({ children, style, ...rest }: TP) {
  const { c } = useTheme();
  return <Body style={[{ color: c.muted }, style as TextStyle]} {...rest}>{children}</Body>;
}
export function H1({ children, style }: TP) {
  const { c } = useTheme();
  return (
    <Text role="heading" aria-level={1} style={[{ fontFamily: fonts.heavy, fontSize: 38, lineHeight: 44, color: c.ink, letterSpacing: -0.5 }, style as TextStyle]}>
      {children}
    </Text>
  );
}
export function H2({ children, style }: TP) {
  const { c } = useTheme();
  return (
    <Text role="heading" aria-level={2} style={[{ fontFamily: fonts.heavy, fontSize: 28, lineHeight: 34, color: c.ink }, style as TextStyle]}>
      {children}
    </Text>
  );
}
export function H3({ children, style }: TP) {
  const { c } = useTheme();
  return (
    <Text role="heading" aria-level={3} style={[{ fontFamily: fonts.bold, fontSize: 21, lineHeight: 27, color: c.ink }, style as TextStyle]}>
      {children}
    </Text>
  );
}
// Handwritten accent. Used sparingly: greetings, Anna's signature, small asides.
export function Hand({ children, style }: TP) {
  const { c } = useTheme();
  return <Text style={[{ fontFamily: fonts.hand, fontSize: 22, lineHeight: 26, color: c.accentInk }, style as TextStyle]}>{children}</Text>;
}

// ---------------------------------------------------------------- flags (drawn, emoji flags do not render on Windows)
export function Flag({ lang }: { lang: 'da' | 'ua' }) {
  const box: ViewStyle = { width: 20, height: 14, borderRadius: 3, overflow: 'hidden', marginRight: 10, marginTop: 5 };
  if (lang === 'ua') {
    return (
      <View style={box} role="img" aria-label="Українською">
        <View style={{ flex: 1, backgroundColor: '#0057B7' }} />
        <View style={{ flex: 1, backgroundColor: '#FFD700' }} />
      </View>
    );
  }
  return (
    <View style={[box, { backgroundColor: '#C8102E' }]} role="img" aria-label="Данською">
      <View style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 2.6, backgroundColor: '#fff' }} />
      <View style={{ position: 'absolute', top: 5.7, left: 0, right: 0, height: 2.6, backgroundColor: '#fff' }} />
    </View>
  );
}

// Danish first, Ukrainian right underneath: the core pattern of the book.
export function DaUa({ da, ua, size = 'lg' }: { da: string; ua: string; size?: 'lg' | 'md' | 'sm' }) {
  const { c } = useTheme();
  const s = { lg: [21, 29, 18, 26], md: [18, 26, 16, 23], sm: [16, 23, 15, 21] }[size];
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row' }}>
        <Flag lang="da" />
        <Text selectable style={{ flex: 1, fontFamily: fonts.bold, fontSize: s[0], lineHeight: s[1], color: c.ink }}>
          {da}
        </Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Flag lang="ua" />
        <Text selectable style={{ flex: 1, fontFamily: fonts.semibold, fontSize: s[2], lineHeight: s[3], color: c.ua }}>
          {ua}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- surfaces
export function Surface({ children, style, tone = 'surface' }: { children: ReactNode; style?: ViewStyle | ViewStyle[]; tone?: 'surface' | 'soft' | 'note' | 'info' }) {
  const { c } = useTheme();
  const bg = { surface: c.surface, soft: c.accentSoft, note: c.noteBg, info: c.infoSoft }[tone];
  const border = tone === 'note' ? c.noteLine : c.line;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: tone === 'soft' ? 'transparent' : border,
          padding: space(5),
          boxShadow: tone === 'surface' ? `0 18px 36px -26px ${c.shadow}` : undefined,
        },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

// ---------------------------------------------------------------- controls
type BtnProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  icon?: Icon;
  iconWeight?: IconProps['weight'];
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'active';
  loading?: boolean;
  style?: ViewStyle;
  full?: boolean;
};

export function Button({ label, icon: I, iconWeight, variant = 'secondary', loading, style, full, disabled, ...rest }: BtnProps) {
  const { c, dark } = useTheme();
  const primaryBg = dark ? c.accent : c.accentInk;
  const bg = { primary: primaryBg, secondary: c.surface, ghost: 'transparent', danger: c.surface, active: c.accentSoft }[variant];
  const fg = { primary: c.onAccent, secondary: c.ink, ghost: c.accentInk, danger: c.bad, active: c.accentInk }[variant];
  const border = { primary: primaryBg, secondary: c.line, ghost: 'transparent', danger: c.bad, active: 'transparent' }[variant];
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      style={({ pressed, hovered }) => [
        {
          minHeight: 44,
          paddingHorizontal: space(4),
          borderRadius: radius.pill,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          alignSelf: full ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.55 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        hovered && variant === 'secondary' ? { backgroundColor: c.surface2 } : null,
        style,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator color={fg} size="small" /> : I ? <I size={19} color={fg} weight={iconWeight} /> : null}
      <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: fg }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      role="button"
      onPress={onPress}
      style={({ hovered }) => ({
        minHeight: 40,
        paddingHorizontal: space(4),
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: active ? 'transparent' : c.line,
        backgroundColor: active || hovered ? c.accentSoft : c.surface,
        justifyContent: 'center',
      })}
    >
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: active ? c.accentInk : c.ink }}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, hint, error, ...input }: TextInputProps & { label: string; hint?: string; error?: string | null }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6, marginBottom: space(4) }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.ink }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={c.muted}
        style={{
          minHeight: 50,
          paddingHorizontal: space(4),
          borderRadius: radius.inner,
          borderWidth: 1,
          borderColor: error ? c.bad : c.line,
          backgroundColor: c.surface,
          fontFamily: fonts.semibold,
          fontSize: 17,
          color: c.ink,
        }}
        {...input}
      />
      {error ? (
        <Text role="alert" style={{ fontFamily: fonts.semibold, fontSize: 14, color: c.bad }}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: c.muted }}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function Banner({ children, tone = 'info', icon: I }: { children: ReactNode; tone?: 'info' | 'warn' | 'ok'; icon?: Icon }) {
  const { c } = useTheme();
  const bg = { info: c.infoSoft, warn: c.accentSoft, ok: c.surface2 }[tone];
  const fg = { info: c.info, warn: c.accentInk, ok: c.ok }[tone];
  return (
    <View role="status" style={{ flexDirection: 'row', gap: 10, padding: space(4), borderRadius: radius.inner, backgroundColor: bg, alignItems: 'flex-start' }}>
      {I ? <I size={22} color={fg} /> : null}
      <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, color: c.ink }}>{children}</Text>
    </View>
  );
}

export function Loading({ label = 'Завантаження…' }: { label?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ padding: space(10), alignItems: 'center', gap: 12 }}>
      <ActivityIndicator color={c.accent} />
      <Muted>{label}</Muted>
    </View>
  );
}

export function Empty({ icon: I, title, children }: { icon: Icon; title: string; children?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: space(8), paddingHorizontal: space(4), gap: 8 }}>
      <I size={38} color={c.accent} weight="duotone" />
      <H3 style={{ textAlign: 'center' }}>{title}</H3>
      {children ? <Muted style={{ textAlign: 'center', maxWidth: 420 }}>{children}</Muted> : null}
    </View>
  );
}
