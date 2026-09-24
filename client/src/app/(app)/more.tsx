import { Link, type Href } from 'expo-router';
import { BookOpenTextIcon, CaretRightIcon, FlowerIcon, ShieldCheckIcon, SignOutIcon } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { Screen, Section } from '@/components/Screen';
import { Footer } from '@/components/shared';
import { H1, Muted, type Icon } from '@/components/ui';
import { useAuth, useProfile } from '@/lib/auth';
import { formatPhone } from '@/lib/phone';
import { fonts, radius, space, useTheme } from '@/theme';
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
        <View style={{ borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: c.line, maxWidth: 560 }}>
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
