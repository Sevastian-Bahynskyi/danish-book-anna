import { Link, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CircleIcon, MagnifyingGlassIcon } from 'phosphor-react-native';
import { useEffect, useRef } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';

import { AnnaNote, DialogueView, MessageCard, MistakeCard, PhraseRow, Quiz, VocabGrid } from '@/components/book';
import { Reveal } from '@/components/effects/Reveal';
import { useIsWide } from '@/components/nav';
import { Screen, Section, useAnchors } from '@/components/Screen';
import { Footer } from '@/components/shared';
import { Body, Button, Chip, Empty, H1, H2, Loading, Muted, Surface } from '@/components/ui';
import { useChapter, useMarkProgress, useProgress } from '@/lib/content';
import { fonts, space, useTheme } from '@/theme';

const PARTS = [
  ['phrases', 'Фрази'],
  ['dialogues', 'Діалог'],
  ['notes', 'Від перекладача'],
  ['mistakes', 'Помилки'],
  ['messages', 'Повідомлення'],
  ['practice', 'Практика'],
  ['vocab', 'Словник'],
] as const;

function Contents() {
  const { go } = useAnchors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }} accessibilityLabel="Зміст розділу">
      {PARTS.map(([id, label]) => (
        <Chip key={id} label={label} onPress={() => go(id)} />
      ))}
    </ScrollView>
  );
}

export default function ChapterScreen() {
  const { c } = useTheme();
  const wide = useIsWide();
  const { width } = useWindowDimensions();
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const ch = useChapter(id);
  const progress = useProgress();
  const mark = useMarkProgress();
  const visited = useRef(false);
  const done = !!progress.data?.find((p) => p.chapter_id === id)?.completed_at;
  const completedOthers = progress.data?.filter((p) => p.completed_at && p.chapter_id !== id).length ?? 0;

  useEffect(() => {
    if (ch.chapter && !visited.current) {
      visited.current = true;
      mark.mutate({ chapterId: id });
    }
  }, [ch.chapter, id, mark]);

  if (ch.isLoading) return <Loading />;
  if (!ch.chapter) {
    return (
      <Screen>
        <Empty icon={MagnifyingGlassIcon} title="Такого розділу немає">
          Поверніться до списку розділів.
        </Empty>
      </Screen>
    );
  }

  const { chapter } = ch;
  const prev = id > 1 ? id - 1 : null;
  const next = id < 12 ? id + 1 : null;
  const vocabCols = width >= 1024 ? 3 : 2;

  const complete = async () => {
    await mark.mutateAsync({ chapterId: id, completed: !done });
    if (!done && completedOthers >= 11) router.push('/finish');
  };

  return (
    <Screen>
      <Reveal>
        <Section style={{ paddingTop: wide ? space(12) : space(8), gap: space(3) }}>
          <Muted style={{ fontFamily: fonts.bold, fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase' }}>Kapitel {chapter.id}</Muted>
          <H1 style={{ fontSize: wide ? 48 : 36, lineHeight: wide ? 54 : 42 }}>{chapter.title_da}</H1>
          <Body style={{ fontSize: 18, lineHeight: 28, color: c.muted, maxWidth: 680 }}>{chapter.intro_ua}</Body>
          <Contents />
        </Section>
      </Reveal>

      <Section anchor="phrases">
        <H2>Фрази</H2>
        <Surface style={{ paddingVertical: space(1) }}>
          {ch.phrases.map((p, i) => (
            <PhraseRow key={p.id} phrase={p} number={i + 1} first={i === 0} />
          ))}
        </Surface>
      </Section>

      {ch.dialogues.length > 0 && (
        <Reveal>
          <Section anchor="dialogues">
            <H2>{ch.dialogues.length > 1 ? 'Міні-діалоги' : 'Міні-діалог'}</H2>
            <View style={{ gap: space(8), maxWidth: 720 }}>
              {ch.dialogues.map((d) => (
                <DialogueView key={d.id} dialogue={d} />
              ))}
            </View>
          </Section>
        </Reveal>
      )}

      <Reveal>
        <Section anchor="notes">
          <H2>Від перекладача</H2>
          <View style={{ gap: space(4), maxWidth: 760 }}>
            {ch.notes.map((n) => (
              <AnnaNote key={n.id} body={n.body_ua} />
            ))}
          </View>
        </Section>
      </Reveal>

      <Reveal>
        <Section anchor="mistakes">
          <H2>Типові помилки</H2>
          <View style={{ flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap', gap: space(3) }}>
            {ch.mistakes.map((m) => (
              <View key={m.id} style={{ width: wide ? '48.8%' : '100%' }}>
                <MistakeCard m={m} />
              </View>
            ))}
          </View>
        </Section>
      </Reveal>

      <Reveal>
        <Section anchor="messages">
          <H2>Готові повідомлення</H2>
          <View style={{ flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap', gap: space(3) }}>
            {ch.messages.map((m) => (
              <View key={m.id} style={{ width: wide ? '48.8%' : '100%' }}>
                <MessageCard m={m} />
              </View>
            ))}
          </View>
        </Section>
      </Reveal>

      <Reveal>
        <Section anchor="practice">
          <H2>Практика</H2>
          <View style={{ gap: space(3), maxWidth: 760 }}>
            {ch.exercises.map((e) => (
              <Quiz key={e.id} ex={e} />
            ))}
          </View>
        </Section>
      </Reveal>

      <Reveal>
        <Section anchor="vocab">
          <H2>Міні-словник</H2>
          <Surface>
            <VocabGrid items={ch.vocab} columns={vocabCols} />
          </Surface>
        </Section>
      </Reveal>

      <Section>
        <Surface tone={done ? 'soft' : 'surface'} style={{ gap: space(3), alignItems: 'flex-start' }}>
          <Body style={{ fontFamily: fonts.bold }}>{done ? 'Розділ пройдено. Можна повертатися до нього будь-коли.' : 'Прочитали розділ і спробували практику?'}</Body>
          <Button variant={done ? 'secondary' : 'primary'} icon={done ? CircleIcon : CheckCircleIcon} label={done ? 'Зняти позначку' : 'Позначити як пройдений'} loading={mark.isPending} onPress={complete} />
        </Surface>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space(3), flexWrap: 'wrap' }}>
          {prev ? (
            <Link href={{ pathname: '/chapter/[id]', params: { id: String(prev) } }} asChild>
              <Button icon={ArrowLeftIcon} label="Попередній розділ" />
            </Link>
          ) : (
            <View />
          )}
          {next ? (
            <Link href={{ pathname: '/chapter/[id]', params: { id: String(next) } }} asChild>
              <Button icon={ArrowRightIcon} label="Наступний розділ" />
            </Link>
          ) : null}
        </View>
      </Section>
      <Footer />
    </Screen>
  );
}
