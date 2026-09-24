import { Link, router, useLocalSearchParams } from 'expo-router';
import { ArrowRightIcon, ChatCircleTextIcon, MagnifyingGlassIcon } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { SaveButton } from '@/components/book';
import { Screen, Section } from '@/components/Screen';
import { SearchBox } from '@/components/shared';
import { Button, DaUa, Empty, H1, H3, Loading, Muted, Surface } from '@/components/ui';
import { useLibrary } from '@/lib/content';
import { SITUATIONS, isExact, relatedChapters, search } from '@/lib/search';
import { fonts, radius, space, useTheme } from '@/theme';
import { Tap } from '@/components/Tap';

export default function SearchScreen() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(params.q ?? '');
  const lib = useLibrary();
  const hits = useMemo(() => (lib.data && q.trim() ? search(lib.data, q) : []), [lib.data, q]);
  const exact = lib.data && q.trim() ? isExact(lib.data, q) : true;
  const related = lib.data && q.trim() ? relatedChapters(lib.data, q) : [];
  const title = (id: number) => lib.data?.chapters.find((ch) => ch.id === id)?.title_da ?? '';

  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <H1>Пошук</H1>
        <SearchBox
          key={params.q ?? ''}
          initial={params.q ?? ''}
          onSearch={(v) => {
            setQ(v);
            router.setParams({ q: v || undefined });
          }}
        />
      </Section>

      {lib.isLoading ? (
        <Loading />
      ) : !q.trim() ? (
        <Section>
          <H3>Що сказати, якщо…</H3>
          <View style={{ gap: 8 }}>
            {SITUATIONS.map((s) => (
              <Tap
                key={s.label}
                role="button"
                onPress={() => {
                  setQ(s.query);
                  router.setParams({ q: s.query });
                }}
                pressStyle={({ hovered }) => ({ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: space(4), borderRadius: radius.inner, backgroundColor: hovered ? c.accentSoft : c.surface, borderWidth: 1, borderColor: c.line })}
              >
                <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: c.ink }}>…{s.label}</Text>
                <ArrowRightIcon size={18} color={c.muted} />
              </Tap>
            ))}
          </View>
        </Section>
      ) : hits.length === 0 ? (
        <Section>
          <Empty icon={MagnifyingGlassIcon} title="Точної фрази не знайшли">
            Спробуйте інше слово, або подивіться схожі ситуації нижче.
          </Empty>
          <View style={{ gap: 8 }}>
            {related.map((ch) => (
              <Link key={ch.id} href={{ pathname: '/chapter/[id]', params: { id: String(ch.id) } }} asChild>
                <Button icon={ArrowRightIcon} label={`${ch.id}. ${ch.title_da}`} />
              </Link>
            ))}
            {SITUATIONS.slice(0, 4).map((s) => (
              <Button key={s.label} variant="ghost" label={`…${s.label}`} onPress={() => { setQ(s.query); router.setParams({ q: s.query }); }} />
            ))}
          </View>
        </Section>
      ) : (
        <Section>
          {related.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <Muted style={{ fontSize: 15 }}>Розділи на цю тему:</Muted>
              {related.map((ch) => (
                <Link key={ch.id} href={{ pathname: '/chapter/[id]', params: { id: String(ch.id) } }} asChild>
                  <Button variant="active" label={`${ch.id}. ${ch.title_da}`} />
                </Link>
              ))}
            </View>
          ) : null}
          <Muted>
            {exact ? `Знайдено: ${hits.length}` : `Точної фрази немає, але ось схожі (${hits.length}):`}
          </Muted>
          <View style={{ gap: space(3) }}>
            {hits.map((h) => (
              <Surface key={`${h.kind}-${h.id}`} style={{ gap: space(3), padding: space(4) }}>
                {h.kind === 'message' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ChatCircleTextIcon size={16} color={c.muted} />
                    <Muted style={{ fontSize: 14 }}>Готове повідомлення: {h.audience}</Muted>
                  </View>
                ) : null}
                <DaUa da={h.da} ua={h.ua} size="md" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  {h.kind !== 'vocab' ? <SaveButton kind={h.kind} id={h.id} /> : null}
                  <Link href={{ pathname: '/chapter/[id]', params: { id: String(h.chapter_id) } }} asChild>
                    <Button variant="ghost" label={`${h.chapter_id}. ${title(h.chapter_id)}`} icon={ArrowRightIcon} />
                  </Link>
                </View>
              </Surface>
            ))}
          </View>
        </Section>
      )}
    </Screen>
  );
}
