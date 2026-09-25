import { Link, type Href } from 'expo-router';
import { BookOpenTextIcon, CaretRightIcon, CircleHalfIcon, DeviceMobileIcon, FlowerIcon, MoonIcon, ShieldCheckIcon, SignOutIcon, SunIcon, TextAlignLeftIcon } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { Screen, Section } from '@/components/Screen';
import { Footer } from '@/components/shared';
import { Button, H1, H3, Muted, Surface, type Icon } from '@/components/ui';
import { useAuth, useProfile } from '@/lib/auth';
import { formatPhone } from '@/lib/phone';
import { canInstallHere, detectDevice, openInstallGuide } from '@/lib/pwa';
import { fonts, radius, space, useTheme, type ThemePref } from '@/theme';
import { Tap } from '@/components/Tap';

function Row({ icon: I, label, href, onPress, danger }: { icon: Icon; label: string; href?: Href; onPress?: () => void; danger?: boolean }) {
  const { c } = useTheme();
  const body = (
    <Tap
      role={href ? 'link' : 'button'}
      onPress={onPress}
      pressStyle={({ hovered }) => ({ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space(4), backgroundColor: hovered ? c.surface2 : c.surface })}
    >
      <I size={22} color={danger ? c.bad : c.accentInk} />
      <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 17, color: danger ? c.bad : c.ink }}>{label}</Text>
      {href ? <CaretRightIcon size={18} color={c.muted} /> : null}
    </Tap>
  );
  return href ? (
    <Link href={href} asChild>
      {body}
    </Link>
  ) : (
    body
  );
}

const THEMES: { id: ThemePref; label: string; icon: Icon }[] = [
  { id: 'system', label: 'Системна', icon: CircleHalfIcon },
  { id: 'light', label: 'Світла', icon: SunIcon },
  { id: 'dark', label: 'Темна', icon: MoonIcon },
];

function ThemePicker() {
  const { c, pref, setPref } = useTheme();
  return (
    <View style={{ gap: space(3), maxWidth: 560 }}>
      <H3>Тема</H3>
      <View role="radiogroup" accessibilityLabel="Тема" style={{ flexDirection: 'row', backgroundColor: c.surface2, borderRadius: radius.pill, padding: 4 }}>
        {THEMES.map((t) => {
          const on = pref === t.id;
          const I = t.icon;
          return (
            <Tap
              key={t.id}
              role="radio"
              aria-checked={on}
              accessibilityLabel={t.label}
              onPress={() => setPref(t.id)}
              style={{ flex: 1, minHeight: 44, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: on ? c.surface : 'transparent' }}
            >
              <I size={18} color={on ? c.accentInk : c.muted} weight={on ? 'fill' : 'regular'} />
              <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: on ? c.accentInk : c.muted }}>{t.label}</Text>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

// Shown in the browser only: inside the installed app there is nothing to do.
function InstallCard() {
  const { c } = useTheme();
  if (!canInstallHere()) return null;
  const phone = detectDevice().os !== 'desktop';
  return (
    <Surface tone="soft" style={{ maxWidth: 560, gap: space(3) }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <DeviceMobileIcon size={28} color={c.accentInk} weight="duotone" />
        <H3 style={{ flex: 1 }}>{phone ? 'Книжка на екрані телефону' : 'Книжка на телефоні'}</H3>
      </View>
      <Muted>
        {phone
          ? 'Поставте іконку книжки на екран телефону. Тоді вона відкриватиметься однією кнопкою, на весь екран, як звичайний застосунок.'
          : 'Книжку можна поставити на екран телефону як застосунок. Покажемо, як це зробити.'}
      </Muted>
      <Button label="Показати, як встановити" icon={DeviceMobileIcon} variant="primary" onPress={openInstallGuide} />
    </Surface>
  );
}

export default function More() {
  const { c } = useTheme();
  const profile = useProfile();
  const { signOut } = useAuth();
  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <H1>Ще</H1>
        {profile ? (
          <Muted>
            {profile.display_name ? `${profile.display_name}, ` : ''}
            {formatPhone(profile.phone)}
          </Muted>
        ) : null}
      </Section>
      <Section>
        <InstallCard />
      </Section>
      <Section>
        <ThemePicker />
      </Section>
      <Section>
        <View style={{ borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: c.line, maxWidth: 560 }}>
          <Row icon={TextAlignLeftIcon} label="Граматика простими словами" href="/grammar" />
          <View style={{ height: 1, backgroundColor: c.line, marginLeft: 50 }} />
          <Row icon={BookOpenTextIcon} label="Про Анну і як користуватися" href="/about" />
          <View style={{ height: 1, backgroundColor: c.line, marginLeft: 50 }} />
          <Row icon={FlowerIcon} label="Фінальна сторінка" href="/finish" />
          {profile?.role === 'admin' ? (
            <>
              <View style={{ height: 1, backgroundColor: c.line, marginLeft: 50 }} />
              <Row icon={ShieldCheckIcon} label="Адмін-панель" href="/admin" />
            </>
          ) : null}
          <View style={{ height: 1, backgroundColor: c.line, marginLeft: 50 }} />
          <Row icon={SignOutIcon} label="Вийти" onPress={signOut} danger />
        </View>
      </Section>
      <Footer />
    </Screen>
  );
}
