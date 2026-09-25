import { Link, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon, ArrowRightIcon, CaretDownIcon, CaretUpIcon, HeartIcon, MagnifyingGlassIcon } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Reveal } from '@/components/effects/Reveal';
import { Eyebrow } from '@/components/GrammarChapter';
import { GrammarText } from '@/components/GrammarText';
import { useIsWide } from '@/components/nav';
import { Screen, Section } from '@/components/Screen';
import { Footer } from '@/components/shared';
import { Body, Button, Empty, H1, H2, Surface } from '@/components/ui';
import { useMarkProgress } from '@/lib/content';
import { LAST_CHAPTER, grammarChapterOf, splitTopicTitle, type GrammarChapter, type GrammarTopic, useGrammarSaved, useMarkTopicRead, useToggleGrammarSaved } from '@/lib/grammar';
import { fonts, radius, space, useTheme } from '@/theme';

function Topic({ topic, chapter }: { topic: GrammarTopic; chapter: GrammarChapter }) {
  const { c } = useTheme();
  const wide = useIsWide();
  const [showAnswers, setShowAnswers] = useState(false);
  const saved = useGrammarSaved();
  const toggle = useToggleGrammarSaved();
  const markRead = useMarkTopicRead();
  const markChapter = useMarkProgress();
  const visited = useRef(false);
  const savedId = `topic:${topic.id}`;
  const isSaved = saved.data?.includes(savedId) ?? false;
  const index = chapter.topics.findIndex((item) => item.id === topic.id);
  const previous = chapter.topics[index - 1];
  const next = chapter.topics[index + 1];
  const title = splitTopicTitle(topic.title);

  useEffect(() => {
    if (!visited.current) {
      visited.current = true;
      markRead.mutate(topic.id);
      markChapter.mutate({ chapterId: chapter.id });
    }
  }, [chapter.id, topic.id, markRead, markChapter]);

  return (
    <Screen>
      <Reveal>
        <Section style={{ paddingTop: wide ? space(10) : space(6), gap: space(3) }}>
          <Link href={{ pathname: '/chapter/[id]', params: { id: String(chapter.id) } }} asChild>
            <Button label={`Розділ ${chapter.id}`} icon={ArrowLeftIcon} variant="ghost" style={{ alignSelf: 'flex-start' }} />
          </Link>
          <Eyebrow>{`Kapitel ${chapter.id} · тема ${index + 1} з ${chapter.topics.length}`}</Eyebrow>
          <H1 style={{ fontSize: wide ? 44 : 32, lineHeight: wide ? 50 : 38 }}>{title.da ?? title.ua}</H1>
          {title.da ? <Body style={{ fontSize: 18, lineHeight: 26, color: c.ua, fontFamily: fonts.semibold, maxWidth: 680 }}>{title.ua}</Body> : null}
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: chapter.topics.length, now: index + 1 }} style={{ height: 6, borderRadius: radius.pill, backgroundColor: c.accentSoft, maxWidth: 360, overflow: 'hidden' }}>
            <View style={{ width: `${((index + 1) / chapter.topics.length) * 100}%`, height: '100%', backgroundColor: c.accent, borderRadius: radius.pill }} />
          </View>
          <Button
            label={isSaved ? 'Збережено для повторення' : 'Повторити пізніше'}
            icon={HeartIcon}
            iconWeight={isSaved ? 'fill' : 'regular'}
            variant={isSaved ? 'active' : 'secondary'}
            disabled={saved.isLoading || toggle.isPending}
            aria-pressed={isSaved}
            style={{ alignSelf: 'flex-start' }}
            onPress={() => toggle.mutate(savedId)}
          />
        </Section>
      </Reveal>

      <Section>
        <GrammarText text={topic.body} topicId={topic.id} />
      </Section>

      {topic.answers ? (
        <Section>
          <Surface tone="note" style={{ gap: space(3), maxWidth: 760, alignItems: 'flex-start' }}>
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
          ) : (
            <View />
          )}
          {next ? (
            <Link href={{ pathname: '/grammar/[id]', params: { id: next.id } }} asChild>
              <Button label="Наступна тема" icon={ArrowRightIcon} variant="primary" />
            </Link>
          ) : chapter.id === LAST_CHAPTER ? (
            <Link href="/grammar/review" asChild>
              <Button label="Шпаргалка і тест" icon={ArrowRightIcon} variant="primary" />
            </Link>
          ) : (
            <Link href={{ pathname: '/chapter/[id]', params: { id: String(chapter.id) } }} asChild>
              <Button label={`Завершити розділ ${chapter.id}`} icon={ArrowRightIcon} variant="primary" />
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
  const chapter = id ? grammarChapterOf(id) : undefined;
  const topic = chapter?.topics.find((item) => item.id === id);
  if (!topic || !chapter) {
    return (
      <Screen>
        <Section style={{ paddingTop: space(8) }}>
          <Empty icon={MagnifyingGlassIcon} title="Такої теми немає">
            Поверніться до списку розділів.
          </Empty>
          <Link href="/chapters" asChild>
            <Button label="Усі розділи" icon={ArrowLeftIcon} />
          </Link>
        </Section>
      </Screen>
    );
  }
  return <Topic key={topic.id} topic={topic} chapter={chapter} />;
}
