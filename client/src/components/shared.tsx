import { Link, router } from 'expo-router';
import { ArrowRightIcon, HeartIcon, MagnifyingGlassIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { useLibrary, useProgress, useSaved } from '@/lib/content';
import { grammarChapter } from '@/lib/grammar';
import { POPULAR } from '@/lib/search';
import { fonts, radius, space, useTheme } from '@/theme';
import { ChapterCard } from './book';
import { Count } from './effects/Count';
import { Reveal } from './effects/Reveal';
import { Button, Chip, DaUa, Empty, H3, Hand, Loading, Muted, Surface } from './ui';

export function SearchBox({ initial = '', onSearch, autoFocus }: { initial?: string; onSearch?: (q: string) => void; autoFocus?: boolean }) {
  const { c, dark } = useTheme();
  const [q, setQ] = useState(initial);
  const go = (value = q) => {
    const v = value.trim();
    if (onSearch) onSearch(v);
    else if (v) router.push({ pathname: '/search', params: { q: v } });
  };
  return (
    <View style={{ gap: space(3) }}>
      <View
        {...({ role: 'search' } as object)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: c.line, paddingLeft: space(4), paddingRight: 6, paddingVertical: 6, boxShadow: `0 18px 36px -26px ${c.shadow}` }}
      >
        <MagnifyingGlassIcon size={22} color={c.muted} />
        <TextInput
          value={q}
          onChangeText={(v) => {
            setQ(v);
            if (onSearch) onSearch(v);
          }}
          onSubmitEditing={() => go()}
          autoFocus={autoFocus}
          placeholder="я захворіла, chef, перерва…"
          placeholderTextColor={c.muted}
          accessibilityLabel="Пошук фрази"
          returnKeyType="search"
          inputMode="search"
          style={{ flex: 1, minWidth: 0, fontFamily: fonts.semibold, fontSize: 18, color: c.ink, paddingVertical: 10 }}
        />
        <Pressable role="button" accessibilityLabel="Пошук" onPress={() => go()} style={{ minHeight: 44, paddingHorizontal: space(5), borderRadius: radius.pill, backgroundColor: dark ? c.accent : c.accentInk, justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.onAccent }}>Пошук</Text>
        </Pressable>
      </View>
      <Muted style={{ fontSize: 15 }}>Що вам потрібно сказати?</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {POPULAR.map((p) => (
          <Chip
            key={p}
            label={p}
            onPress={() => {
              setQ(p);
              go(p);
            }}
          />
        ))}
      </View>
    </View>
  );
}

export function useColumns(min = 300, max = 3) {
  const { width } = useWindowDimensions();
  return Math.max(1, Math.min(max, Math.floor((Math.min(width, 1120) - 32) / min)));
}

export function ChapterGrid() {
  const lib = useLibrary();
  const progress = useProgress();
  const cols = useColumns(300, 3);
  if (lib.isLoading) return <Loading />;
  if (!lib.data) return <Empty icon={MagnifyingGlassIcon} title="Не вдалося завантажити розділи">Перевірте інтернет і оновіть сторінку.</Empty>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
      {lib.data.chapters.map((ch) => {
        const p = progress.data?.find((x) => x.chapter_id === ch.id);
        return (
          <View key={ch.id} style={{ width: `${100 / cols}%`, padding: 6 }}>
            <ChapterCard ch={ch} done={!!p?.completed_at} visited={!!p} meta={topicCount(ch.id)} />
          </View>
        );
      })}
    </View>
  );
}

// Grammar chapters (13, 14) list topics instead of phrases.
function topicCount(id: number): string | undefined {
  const grammar = grammarChapter(id);
  return grammar ? `${grammar.topics.length} тем` : undefined;
}

// The chapter to continue with: first chapter that is not completed.
export function useNextChapter() {
  const lib = useLibrary();
  const progress = useProgress();
  const done = new Set(progress.data?.filter((p) => p.completed_at).map((p) => p.chapter_id));
  const next = lib.data?.chapters.find((c) => !done.has(c.id));
  return { next, done: done.size, total: lib.data?.chapters.length ?? 14, started: (progress.data?.length ?? 0) > 0 };
}

export function ContinueCard() {
  const { c } = useTheme();
  const { next, done, total, started } = useNextChapter();
  const { width } = useWindowDimensions();
  const row = width >= 700;
  if (!next) {
    return (
      <Surface tone="soft" style={{ gap: space(3) }}>
        <H3>🌸 Ви пройшли всі {total} розділів</H3>
        <Link href="/finish" asChild>
          <Button variant="primary" label="Відкрити фінальну сторінку" icon={ArrowRightIcon} />
        </Link>
      </Surface>
    );
  }
  return (
    <View style={{ borderRadius: radius.card, padding: space(6), backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, flexDirection: row ? 'row' : 'column', gap: space(5), alignItems: row ? 'center' : 'flex-start', boxShadow: `0 18px 36px -26px ${c.shadow}` }}>
      <View style={{ flex: row ? 1 : undefined, gap: 4 }}>
        <Muted style={{ fontSize: 15 }}>{started ? 'Продовжити читати' : 'Почніть з першого розділу'}</Muted>
        <H3 style={{ fontSize: 26, lineHeight: 32 }}>{next.title_da}</H3>
        <Muted>
          Розділ {next.id}. {next.description_ua}
        </Muted>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(5), flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Count to={done} style={{ fontFamily: fonts.heavy, fontSize: 44, lineHeight: 48, color: c.accentInk }} />
          <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: c.muted }}> / {total}</Text>
        </View>
        <Link href={{ pathname: '/chapter/[id]', params: { id: String(next.id) } }} asChild>
          <Button variant="primary" label={started ? 'Читати далі' : 'Почати'} icon={ArrowRightIcon} />
        </Link>
      </View>
    </View>
  );
}

export function SavedPreview({ limit = 3 }: { limit?: number }) {
  const { c } = useTheme();
  const saved = useSaved();
  const lib = useLibrary();
  const items = (saved.data ?? [])
    .map((s) => {
      const src = s.kind === 'phrase' ? lib.data?.phrases.find((p) => p.id === s.item_id) : lib.data?.messages.find((m) => m.id === s.item_id);
      return src ? { key: `${s.kind}-${s.item_id}`, da: src.da, ua: src.ua } : null;
    })
    .filter(Boolean)
    .slice(0, limit) as { key: string; da: string; ua: string }[];
  return (
    <Surface style={{ gap: space(3) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <HeartIcon size={22} color={c.accent} weight="fill" />
        <H3>Мої збережені фрази</H3>
      </View>
      {items.length === 0 ? (
        <Muted style={{ fontSize: 15 }}>Тут з’являться фрази, які ви збережете. Натисніть «Зберегти» біля будь-якої фрази.</Muted>
      ) : (
        items.map((it) => (
          <View key={it.key} style={{ borderRadius: radius.inner, backgroundColor: c.surface2, padding: space(3) }}>
            <DaUa da={it.da} ua={it.ua} size="sm" />
          </View>
        ))
      )}
      <Link href="/saved" asChild>
        <Button variant="ghost" label="Усі збережені" icon={ArrowRightIcon} style={{ paddingHorizontal: 0 }} />
      </Link>
    </Surface>
  );
}

export function Footer() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space(8), gap: 2 }}>
      <Muted style={{ fontSize: 14 }}>Created by</Muted>
      <Hand style={{ fontSize: 22 }}>Anna Melnykova</Hand>
    </View>
  );
}

export { Reveal };
