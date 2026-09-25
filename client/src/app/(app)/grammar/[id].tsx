import { Link, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon, ArrowRightIcon, CaretDownIcon, CaretUpIcon, HeartIcon, MagnifyingGlassIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { GrammarText } from '@/components/GrammarText';
import { Screen, Section } from '@/components/Screen';
import { Footer } from '@/components/shared';
import { Body, Button, Empty, H1, H2, Muted, Surface } from '@/components/ui';
import { grammarContent, type GrammarTopic, useGrammarSaved, useToggleGrammarSaved } from '@/lib/grammar';
import { fonts, space } from '@/theme';

function Topic({ topic }: { topic: GrammarTopic }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const saved = useGrammarSaved();
  const toggle = useToggleGrammarSaved();
  const savedId = `topic:${topic.id}`;
  const isSaved = saved.data?.includes(savedId) ?? false;
  const index = grammarContent.topics.findIndex((item) => item.id === topic.id);
  const previous = grammarContent.topics[index - 1];
  const next = grammarContent.topics[index + 1];

  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <Link href="/grammar" asChild>
          <Button label="Усі теми" icon={ArrowLeftIcon} variant="ghost" />
        </Link>
        <Muted style={{ fontFamily: fonts.bold, letterSpacing: 1.3 }}>ТЕМА {topic.id}</Muted>
        <H1>{topic.title}</H1>
        <Button
          label={isSaved ? 'Збережено для повторення' : 'Повторити пізніше'}
          icon={HeartIcon}
          iconWeight={isSaved ? 'fill' : 'regular'}
          variant={isSaved ? 'active' : 'secondary'}
          disabled={saved.isLoading || toggle.isPending}
          aria-pressed={isSaved}
          onPress={() => toggle.mutate(savedId)}
        />
      </Section>

      <Section>
        <GrammarText text={topic.body} topicId={topic.id} />
      </Section>

      {topic.answers ? (
        <Section>
          <Surface tone="note" style={{ gap: space(3), maxWidth: 760 }}>
            <H2>Перевірте себе</H2>
            <Body>Спробуйте виконати вправу вище, а потім звірте відповіді.</Body>
            <Button
              label={showAnswers ? 'Сховати відповіді' : 'Показати відповіді'}
              icon={showAnswers ? CaretUpIcon : CaretDownIcon}
              aria-expanded={showAnswers}
              onPress={() => setShowAnswers(!showAnswers)}
            />
            {showAnswers ? <GrammarText text={topic.answers} /> : null}
          </Surface>
        </Section>
      ) : null}

      <Section>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: space(3) }}>
          {previous ? (
            <Link href={{ pathname: '/grammar/[id]', params: { id: previous.id } }} asChild>
              <Button label="Попередня тема" icon={ArrowLeftIcon} />
            </Link>
          ) : <View />}
          {next ? (
            <Link href={{ pathname: '/grammar/[id]', params: { id: next.id } }} asChild>
              <Button label="Наступна тема" icon={ArrowRightIcon} />
            </Link>
          ) : (
            <Link href="/grammar/review" asChild>
              <Button label="Шпаргалка і тест" icon={ArrowRightIcon} variant="primary" />
            </Link>
          )}
        </View>
      </Section>
      <Footer />
    </Screen>
  );
}

export default function GrammarTopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = grammarContent.topics.find((item) => item.id === id);
  if (!topic) {
    return (
      <Screen>
        <Section style={{ paddingTop: space(8) }}>
          <Empty icon={MagnifyingGlassIcon} title="Такої теми немає">Поверніться до списку граматичних тем.</Empty>
          <Link href="/grammar" asChild><Button label="Усі теми" icon={ArrowLeftIcon} /></Link>
        </Section>
      </Screen>
    );
  }
  return <Topic key={topic.id} topic={topic} />;
}
