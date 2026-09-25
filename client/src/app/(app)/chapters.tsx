import { View } from 'react-native';

import { Screen, Section } from '@/components/Screen';
import { ChapterGrid, ContinueCard, Footer, useNextChapter } from '@/components/shared';
import { H1, Muted } from '@/components/ui';
import { space } from '@/theme';

export default function Chapters() {
  const { done, total } = useNextChapter();
  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <View style={{ gap: 4 }}>
          <H1>Розділи</H1>
          <Muted>{done} / {total} kapitler. Можна йти по порядку або відкривати те, що потрібно зараз.</Muted>
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
