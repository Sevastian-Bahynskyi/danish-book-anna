import { View } from 'react-native';

import { Reveal } from '@/components/effects/Reveal';
import { Screen, Section } from '@/components/Screen';
import { Footer } from '@/components/shared';
import { Body, H1, H2, Hand, Surface } from '@/components/ui';
import { ABOUT } from '@/lib/about';
import { fonts, space, useTheme } from '@/theme';

export default function About() {
  const { c } = useTheme();
  return (
    <Screen>
      <Section style={{ paddingTop: space(8), maxWidth: 760 }}>
        <Hand style={{ fontSize: 26 }}>💛 Про мене</Hand>
        <H1>Привіт! Я Анна.</H1>
        {ABOUT.about.map((p, i) => (
          <Body key={i} style={{ fontSize: 18, lineHeight: 29 }}>
            {i === 0 ? p.replace(/^Привіт! Я Анна\. /, '') : p}
          </Body>
        ))}
        <Hand style={{ alignSelf: 'flex-end', fontSize: 24 }}>Anna Melnykova</Hand>
      </Section>
      <Reveal>
        <Section style={{ maxWidth: 760 }}>
          <H2>Як користуватися</H2>
          <Surface tone="note" style={{ gap: space(3) }}>
            {ABOUT.howTo.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: space(3) }}>
                <Body style={{ fontFamily: fonts.heavy, color: c.accentInk, width: 22 }}>{i + 1}.</Body>
                <Body style={{ flex: 1 }}>{step}</Body>
              </View>
            ))}
          </Surface>
        </Section>
      </Reveal>
      <Footer />
    </Screen>
  );
}
