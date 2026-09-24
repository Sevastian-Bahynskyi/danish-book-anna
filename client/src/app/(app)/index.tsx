import { Link } from 'expo-router';
import { ArrowRightIcon } from 'phosphor-react-native';
import { View } from 'react-native';

import { BlurHeading } from '@/components/effects/BlurHeading';
import { FadeEdge } from '@/components/effects/FadeEdge';
import { Reveal } from '@/components/effects/Reveal';
import { SilkBackground } from '@/components/effects/SilkBackground';
import { useIsWide } from '@/components/nav';
import { Screen, Section } from '@/components/Screen';
import { ChapterGrid, ContinueCard, Footer, SavedPreview, SearchBox } from '@/components/shared';
import { Body, Button, H2, Hand, Surface } from '@/components/ui';
import { useProfile } from '@/lib/auth';
import { MAX_WIDTH, fonts, space, useTheme } from '@/theme';

function Hero() {
  const { c } = useTheme();
  const wide = useIsWide();
  const profile = useProfile();
  const name = profile?.display_name?.split(' ')[0];
  return (
    <View style={{ position: 'relative', overflow: 'hidden' }}>
      <SilkBackground />
      <FadeEdge height={140} />
      <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: wide ? space(8) : space(4), paddingTop: wide ? space(16) : space(8), paddingBottom: space(8), flexDirection: wide ? 'row' : 'column', gap: space(8), alignItems: wide ? 'flex-end' : 'stretch' }}>
        <View style={{ flex: wide ? 1.4 : undefined, gap: space(4) }}>
          <Hand style={{ fontSize: 26, lineHeight: 30 }}>{name ? `Hej, ${name}! 💛` : 'Hej! 💛'}</Hand>
          <BlurHeading text="Ви вже зробили перший крок." style={{ fontFamily: fonts.heavy, fontSize: wide ? 54 : 36, lineHeight: wide ? 60 : 42, color: c.ink, letterSpacing: -0.8 }} />
          <Body style={{ fontSize: wide ? 20 : 18, lineHeight: wide ? 30 : 27, color: c.muted, maxWidth: 560 }}>
            Цей матеріал створений для того, щоб вам було легше говорити данською на роботі, без страху, що ви скажете щось неправильно.
          </Body>
          <View style={{ marginTop: space(2), maxWidth: 640 }}>
            <SearchBox />
          </View>
        </View>
        {wide && (
          <View style={{ flex: 1 }}>
            <SavedPreview />
          </View>
        )}
      </View>
    </View>
  );
}

export default function Home() {
  const wide = useIsWide();
  return (
    <Screen hero={<Hero />}>
      <Reveal>
        <Section>
          <ContinueCard />
        </Section>
      </Reveal>
      {!wide && (
        <Reveal>
          <Section>
            <SavedPreview />
          </Section>
        </Reveal>
      )}
      <Reveal>
        <Section>
          <H2>Розділи</H2>
          <ChapterGrid />
        </Section>
      </Reveal>
      <Reveal>
        <Section>
          <Surface tone="note" style={{ gap: space(3) }}>
            <Hand>Як користуватися</Hand>
            <Body>Прочитайте данську фразу, подивіться переклад і скажіть її вголос кілька разів. Потім спробуйте пригадати данську, дивлячись лише на український переклад.</Body>
            <Link href="/about" asChild>
              <Button variant="ghost" label="Про Анну і цей матеріал" icon={ArrowRightIcon} style={{ paddingHorizontal: 0 }} />
            </Link>
          </Surface>
        </Section>
      </Reveal>
      <Footer />
    </Screen>
  );
}
