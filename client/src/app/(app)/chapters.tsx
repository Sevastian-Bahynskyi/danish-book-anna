import { Link } from 'expo-router';
import { ArrowRightIcon } from 'phosphor-react-native';
import { View } from 'react-native';

import { Screen, Section } from '@/components/Screen';
import { ChapterGrid, ContinueCard, Footer } from '@/components/shared';
import { Body, Button, H1, H2, Muted, Surface } from '@/components/ui';
import { useCompletedCount } from '@/lib/content';
import { space } from '@/theme';

export default function Chapters() {
  const done = useCompletedCount();
  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <View style={{ gap: 4 }}>
          <H1>Розділи</H1>
          <Muted>{done} / 12 kapitler. Можна йти по порядку або відкривати те, що потрібно зараз.</Muted>
        </View>
        <ContinueCard />
      </Section>
      <Section>
        <ChapterGrid />
      </Section>
      <Section>
        <Surface tone="note" style={{ gap: space(3), maxWidth: 760 }}>
          <Muted>РОЗДІЛИ 13–14</Muted>
          <H2>Граматика простими словами</H2>
          <Body>18 коротких тем про порядок слів, маленькі слова та конструкції, які ви зустрічаєте щодня. Наприкінці — шпаргалка і тест.</Body>
          <Link href="/grammar" asChild>
            <Button variant="primary" label="Відкрити граматику" icon={ArrowRightIcon} />
          </Link>
        </Surface>
      </Section>
      <Footer />
    </Screen>
  );
}
