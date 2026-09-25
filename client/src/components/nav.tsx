import { Link, usePathname, type Href } from 'expo-router';
import { BookOpenIcon, BooksIcon, DotsThreeCircleIcon, HeartIcon, HouseIcon, MagnifyingGlassIcon } from 'phosphor-react-native';
import { Image, Platform, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCompletedCount } from '@/lib/content';
import { MAX_WIDTH, WIDE, fonts, radius, space, useTheme } from '@/theme';
import { Count } from './effects/Count';
import type { Icon } from './ui';
import { Tap } from './Tap';

export const useIsWide = () => useWindowDimensions().width >= WIDE;

const TABS: { href: Href; label: string; icon: Icon; match: (p: string) => boolean }[] = [
  { href: '/', label: 'Головна', icon: HouseIcon, match: (p) => p === '/' },
  { href: '/chapters', label: 'Розділи', icon: BooksIcon, match: (p) => p.startsWith('/chapter') || p.startsWith('/grammar') },
  { href: '/search', label: 'Пошук', icon: MagnifyingGlassIcon, match: (p) => p.startsWith('/search') },
  { href: '/saved', label: 'Збережені', icon: HeartIcon, match: (p) => p.startsWith('/saved') },
  { href: '/more', label: 'Ще', icon: DotsThreeCircleIcon, match: (p) => ['/more', '/about', '/admin', '/finish'].some((x) => p.startsWith(x)) },
];

// Translucent material on the floating bars only (never on content).
function glass(bg: string): ViewStyle {
  return Platform.OS === 'web'
    ? ({ backgroundColor: bg + 'D9', backdropFilter: 'saturate(1.6) blur(18px)', WebkitBackdropFilter: 'saturate(1.6) blur(18px)' } as ViewStyle)
    : { backgroundColor: bg };
}

export function ProgressPill() {
  const { c } = useTheme();
  const done = useCompletedCount();
  return (
    <Link href="/chapters" asChild>
      <Tap
        accessibilityLabel={`Прогрес: ${done} з 12 розділів`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: space(3), borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line }}
      >
        <BookOpenIcon size={18} color={c.accent} weight="fill" />
        <Count to={done} style={{ fontFamily: fonts.heavy, fontSize: 14, color: c.ink }} />
        <Text style={{ fontFamily: fonts.heavy, fontSize: 14, color: c.ink }}>/ 12</Text>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: c.muted }}>kapitler</Text>
      </Tap>
    </Link>
  );
}

function Brand() {
  const { c } = useTheme();
  return (
    <Link href="/" asChild>
      <Tap accessibilityLabel="DANSK PÅ ARBEJDE, на головну" style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Image source={require('@/assets/images/favicon.png')} style={{ width: 36, height: 36 }} accessibilityIgnoresInvertColors />
        <View>
          <Text style={{ fontFamily: fonts.heavy, fontSize: 14, letterSpacing: 1, color: c.ink }}>DANSK PÅ ARBEJDE</Text>
          <Text style={{ fontFamily: fonts.hand, fontSize: 17, lineHeight: 18, color: c.accentInk }}>by Anna Melnykova</Text>
        </View>
      </Tap>
    </Link>
  );
}

export function TopBar() {
  const { c } = useTheme();
  const wide = useIsWide();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ paddingTop: insets.top, borderBottomWidth: 1, borderBottomColor: c.line, zIndex: 10 }, glass(c.bg)]}>
      <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', height: 64, paddingHorizontal: wide ? space(8) : space(4), flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
        <Brand />
        <View style={{ flex: 1 }} />
        {wide &&
          TABS.map((t) => {
            const on = t.match(path);
            const I = t.icon;
            return (
              <Link key={t.label} href={t.href} asChild>
                <Tap
                  role="link"
                  aria-current={on ? 'page' : undefined}
                  pressStyle={({ hovered }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: space(3), borderRadius: radius.pill, backgroundColor: on ? c.accentSoft : hovered ? c.surface2 : 'transparent' })}
                >
                  <I size={19} color={on ? c.accentInk : c.muted} weight={on ? 'fill' : 'regular'} />
                  <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: on ? c.accentInk : c.muted }}>{t.label}</Text>
                </Tap>
              </Link>
            );
          })}
        <ProgressPill />
      </View>
    </View>
  );
}

// Bottom tab bar on phones: top-level sections, always visible.
export function TabBar() {
  const { c } = useTheme();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <View
      role="tablist"
      style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingTop: 6, paddingBottom: 6 + insets.bottom, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: c.line }, glass(c.surface)]}
    >
      {TABS.map((t) => {
        const on = t.match(path);
        const I = t.icon;
        return (
          <Link key={t.label} href={t.href} asChild>
            <Tap role="tab" aria-selected={on} accessibilityLabel={t.label} style={{ flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <I size={25} color={on ? c.accentInk : c.muted} weight={on ? 'fill' : 'regular'} />
              <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: on ? c.accentInk : c.muted }}>{t.label}</Text>
            </Tap>
          </Link>
        );
      })}
    </View>
  );
}
