import { Link } from 'expo-router';
import { ArrowRightIcon } from 'phosphor-react-native';
import { View } from 'react-native';

import { BlurHeading } from '@/components/effects/BlurHeading';
import { SilkBackground } from '@/components/effects/SilkBackground';
import { Screen, Section } from '@/components/Screen';
import { Body, Button, Hand, Muted } from '@/components/ui';
import { useChapterTotal, useCompletedCount } from '@/lib/content';
import { fonts, radius, space, useTheme } from '@/theme';

export default function Finish() {
  const { c } = useTheme();
  const done = useCompletedCount();
  const total = useChapterTotal();
  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <View style={{ borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: c.line }}>
          <SilkBackground />
          <View style={{ padding: space(8), paddingVertical: space(14), alignItems: 'center', gap: space(3), backgroundColor: c.surface + 'B3' }}>
            <BlurHeading text="🌸 Du gjorde det!" style={{ fontFamily: fonts.heavy, fontSize: 46, lineHeight: 52, color: c.ink, textAlign: 'center' }} />
            {done >= total ? (
              <>
                <Body style={{ fontFamily: fonts.heavy, fontSize: 20, textAlign: 'center' }}>Ви пройшли весь матеріал.</Body>
                <Body style={{ fontSize: 18, lineHeight: 28, textAlign: 'center', maxWidth: 520 }}>Тепер, коли вам потрібно щось сказати на роботі, ви знаєте, де це знайти.</Body>
                <Body style={{ fontSize: 18, lineHeight: 28, textAlign: 'center', maxWidth: 520 }}>Датська вже не просто «десь там». Ви взяли її у свої руки.</Body>
                <Hand style={{ fontSize: 28, marginTop: space(2) }}>Anna Melnykova</Hand>
              </>
            ) : (
              <>
                <Muted style={{ textAlign: 'center', maxWidth: 480 }}>Ця сторінка відкриється повністю, коли ви пройдете всі {total} розділів. Зараз: {done} / {total}.</Muted>
                <Link href="/chapters" asChild>
                  <Button variant="primary" icon={ArrowRightIcon} label="До розділів" />
                </Link>
              </>
            )}
          </View>
        </View>
      </Section>
    </Screen>
  );
}
