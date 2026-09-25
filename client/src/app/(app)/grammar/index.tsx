import { Link } from 'expo-router';
import { ArrowRightIcon, BookOpenTextIcon, HeartIcon } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { GrammarText } from '@/components/GrammarText';
import { Screen, Section } from '@/components/Screen';
import { Tap } from '@/components/Tap';
import { Footer } from '@/components/shared';
import { Body, Button, H1, H2, Muted, Surface } from '@/components/ui';
import { grammarContent, useGrammarSaved } from '@/lib/grammar';
import { fonts, space, useTheme } from '@/theme';

export default function GrammarIndex() {
  const { c } = useTheme();
  const saved = useGrammarSaved();
  const bookmarked = new Set(saved.data ?? []);
  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <Muted style={{ fontFamily: fonts.bold, letterSpacing: 1.4 }}>DANSK PÅ ARBEJDE · РОЗДІЛИ 13–14</Muted>
        <H1>Граматика простими словами</H1>
        <Body style={{ maxWidth: 720 }}>Короткі пояснення, живі приклади та практика, щоб будувати власні речення данською.</Body>
        <Muted style={{ maxWidth: 720 }}>Деякі приклади мають записане аудіо; решту озвучує ваш пристрій.</Muted>
      </Section>

      <Section>
        <GrammarText text={grammarContent.intro} />
      </Section>

      {grammarContent.chapters.map((chapter) => {
        const topics = grammarContent.topics.filter((topic) => topic.id.startsWith(`${chapter.id}.`));
        return (
          <Section key={chapter.id}>
            <View style={{ gap: space(2) }}>
              <Muted style={{ fontFamily: fonts.bold, letterSpacing: 1.3 }}>РОЗДІЛ {chapter.id}</Muted>
              <H2>{chapter.title}</H2>
            </View>
            {chapter.intro ? <GrammarText text={chapter.intro} /> : null}
            <View style={{ gap: space(3), maxWidth: 760 }}>
              {topics.map((topic) => (
                <Link key={topic.id} href={{ pathname: '/grammar/[id]', params: { id: topic.id } }} asChild>
                  <Tap role="link" accessibilityLabel={`${topic.id}. ${topic.title}`} style={{ flexDirection: 'row', alignItems: 'center', gap: space(3), minHeight: 68, padding: space(4), borderRadius: 24, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface }}>
                    <Text style={{ width: 48, fontFamily: fonts.heavy, fontSize: 15, color: c.accentInk }}>{topic.id}</Text>
                    <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 18, lineHeight: 25, color: c.ink }}>{topic.title}</Text>
                    {bookmarked.has(`topic:${topic.id}`) ? <HeartIcon size={19} color={c.accentInk} weight="fill" /> : null}
                    <ArrowRightIcon size={19} color={c.muted} />
                  </Tap>
                </Link>
              ))}
            </View>
          </Section>
        );
      })}

      <Section>
        <Surface tone="note" style={{ gap: space(3), maxWidth: 760 }}>
          <BookOpenTextIcon size={28} color={c.accentInk} />
          <H2>Шпаргалка і тест</H2>
          <Body>Повторіть головні конструкції та перевірте себе у 17 запитаннях.</Body>
          <Link href="/grammar/review" asChild>
            <Button variant="primary" label="Перейти до практики" icon={ArrowRightIcon} />
          </Link>
        </Surface>
      </Section>
      <Footer />
    </Screen>
  );
}
