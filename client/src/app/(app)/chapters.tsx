import { View } from 'react-native';

import { Screen, Section } from '@/components/Screen';
import { ChapterGrid, ContinueCard, Footer } from '@/components/shared';
import { H1, Muted } from '@/components/ui';
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
      <Footer />
    </Screen>
  );
}
