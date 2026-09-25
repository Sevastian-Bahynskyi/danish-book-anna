import { Link, router } from 'expo-router';
import { ArrowLeftIcon, ArrowRightIcon, CaretDownIcon, CaretRightIcon, CaretUpIcon, CheckCircleIcon, CheckIcon, CircleIcon, ExamIcon, HeartIcon } from 'phosphor-react-native';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Text, View } from 'react-native';

import { Reveal } from '@/components/effects/Reveal';
import { GrammarText } from '@/components/GrammarText';
import { useIsWide } from '@/components/nav';
import { Screen, Section } from '@/components/Screen';
import { Footer } from '@/components/shared';
import { Tap } from '@/components/Tap';
import { Body, Button, H1, H2, Muted, Surface } from '@/components/ui';
import { useChapterTotal, useMarkProgress, useProgress } from '@/lib/content';
import { LAST_CHAPTER, grammarContent, splitTopicTitle, useGrammarRead, useGrammarSaved, type GrammarChapter, type GrammarTopic } from '@/lib/grammar';
import { fonts, space, useTheme } from '@/theme';

export function Eyebrow({ children }: { children: string }): ReactElement {
  return <Muted style={{ fontFamily: fonts.bold, fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase' }}>{children}</Muted>;
}

function TopicRow({ topic, number, first, read, saved }: { topic: GrammarTopic; number: number; first: boolean; read: boolean; saved: boolean }): ReactElement {
  const { c } = useTheme();
  const title = splitTopicTitle(topic.title);
  return (
    <Link href={{ pathname: '/grammar/[id]', params: { id: topic.id } }} asChild>
      <Tap
        role="link"
        accessibilityLabel={`Тема ${number}: ${topic.title}${read ? ', прочитано' : ''}`}
        pressStyle={({ hovered, pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: space(3),
          minHeight: 64,
          paddingVertical: space(4),
          paddingHorizontal: space(4),
          borderTopWidth: first ? 0 : 1,
          borderTopColor: c.line,
          backgroundColor: hovered || pressed ? c.accentSoft : 'transparent',
        })}
      >
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: read ? c.accentInk : c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          {read ? <CheckIcon size={15} color={c.onAccent} weight="bold" /> : <Text style={{ fontFamily: fonts.heavy, fontSize: 13, color: c.accentInk }}>{number}</Text>}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          {title.da ? <Text style={{ fontFamily: fonts.bold, fontSize: 18, lineHeight: 25, color: c.ink }}>{title.da}</Text> : null}
          <Text style={{ fontFamily: title.da ? fonts.semibold : fonts.bold, fontSize: title.da ? 15 : 17, lineHeight: title.da ? 21 : 24, color: title.da ? c.ua : c.ink }}>{title.ua}</Text>
        </View>
        {saved ? <HeartIcon size={18} color={c.accentInk} weight="fill" /> : null}
        <CaretRightIcon size={18} color={c.muted} />
      </Tap>
    </Link>
  );
}

export function GrammarChapterView({ chapter }: { chapter: GrammarChapter }): ReactElement {
  const { c } = useTheme();
  const wide = useIsWide();
  const progress = useProgress();
  const readTopics = useGrammarRead();
  const saved = useGrammarSaved();
  const mark = useMarkProgress();
  const total = useChapterTotal();
  const visited = useRef(false);
  const [howTo, setHowTo] = useState(false);
  const done = !!progress.data?.find((p) => p.chapter_id === chapter.id)?.completed_at;
  const completedOthers = progress.data?.filter((p) => p.completed_at && p.chapter_id !== chapter.id).length ?? 0;
  const read = new Set(readTopics.data ?? []);
  const readHere = chapter.topics.filter((topic) => read.has(topic.id)).length;
  const bookmarked = new Set(saved.data ?? []);
  const first = chapter.id === grammarContent.chapters[0]?.id;
  const last = chapter.id === LAST_CHAPTER;

  useEffect(() => {
    if (!visited.current) {
      visited.current = true;
      mark.mutate({ chapterId: chapter.id });
    }
  }, [chapter.id, mark]);

  const complete = async (): Promise<void> => {
    await mark.mutateAsync({ chapterId: chapter.id, completed: !done });
    if (!done && completedOthers >= total - 1) router.push('/finish');
  };

  return (
    <Screen>
      <Reveal>
        <Section style={{ paddingTop: wide ? space(12) : space(8), gap: space(3) }}>
          <Eyebrow>{`Kapitel ${chapter.id} · grammatik`}</Eyebrow>
          <H1 style={{ fontSize: wide ? 48 : 36, lineHeight: wide ? 54 : 42 }}>{chapter.title_da}</H1>
          <Body style={{ fontSize: 18, lineHeight: 28, color: c.ua, fontFamily: fonts.semibold, maxWidth: 680 }}>{chapter.description_ua}</Body>
          <Muted>{`${chapter.topics.length} тем · прочитано ${readHere}`}</Muted>
        </Section>
      </Reveal>

      {first ? (
        <Section>
          <Surface tone="note" style={{ gap: space(3), maxWidth: 760 }}>
            <H2>Як користуватися розділами 13 і 14</H2>
            <Body>Короткі пояснення з прикладами. Кожен приклад можна послухати, відкрити переклад і зберегти.</Body>
            <Button label={howTo ? 'Згорнути' : 'Читати вступ'} icon={howTo ? CaretUpIcon : CaretDownIcon} aria-expanded={howTo} onPress={() => setHowTo(!howTo)} />
            {howTo ? <GrammarText text={grammarContent.intro} /> : null}
          </Surface>
        </Section>
      ) : null}

      {chapter.intro ? (
        <Reveal>
          <Section>
            <GrammarText text={chapter.intro} />
          </Section>
        </Reveal>
      ) : null}

      <Reveal>
        <Section>
          <H2>Теми</H2>
          <Surface style={{ padding: 0, overflow: 'hidden', maxWidth: 760 }}>
            {chapter.topics.map((topic, index) => (
              <TopicRow key={topic.id} topic={topic} number={index + 1} first={index === 0} read={read.has(topic.id)} saved={bookmarked.has(`topic:${topic.id}`)} />
            ))}
          </Surface>
        </Section>
      </Reveal>

      {last ? (
        <Reveal>
          <Section>
            <Surface tone="soft" style={{ gap: space(3), maxWidth: 760, alignItems: 'flex-start' }}>
              <ExamIcon size={30} color={c.accentInk} weight="duotone" />
              <H2>Шпаргалка і тест</H2>
              <Body>Головні конструкції на одній сторінці та {grammarContent.quiz.length} запитань, щоб перевірити себе.</Body>
              <Link href="/grammar/review" asChild>
                <Button variant="primary" label="Перейти до тесту" icon={ArrowRightIcon} />
              </Link>
            </Surface>
          </Section>
        </Reveal>
      ) : null}

      <Section>
        <Surface tone={done ? 'soft' : 'surface'} style={{ gap: space(3), alignItems: 'flex-start' }}>
          <Body style={{ fontFamily: fonts.bold }}>{done ? 'Розділ пройдено. Можна повертатися до нього будь-коли.' : 'Прочитали теми і спробували вправи?'}</Body>
          <Button
            variant={done ? 'secondary' : 'primary'}
            icon={done ? CircleIcon : CheckCircleIcon}
            label={done ? 'Зняти позначку' : 'Позначити як пройдений'}
            loading={mark.isPending}
            disabled={!progress.data}
            onPress={complete}
          />
        </Surface>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space(3), flexWrap: 'wrap' }}>
          <Link href={{ pathname: '/chapter/[id]', params: { id: String(chapter.id - 1) } }} asChild>
            <Button icon={ArrowLeftIcon} label="Попередній розділ" />
          </Link>
          {last ? null : (
            <Link href={{ pathname: '/chapter/[id]', params: { id: String(chapter.id + 1) } }} asChild>
              <Button icon={ArrowRightIcon} label="Наступний розділ" />
            </Link>
          )}
        </View>
      </Section>
      <Footer />
    </Screen>
  );
}
