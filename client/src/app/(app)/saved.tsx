import { Link } from 'expo-router';
import { ArrowRightIcon, ChatCircleTextIcon, HeartIcon } from 'phosphor-react-native';
import { View } from 'react-native';

import { SaveButton } from '@/components/book';
import { Screen, Section } from '@/components/Screen';
import { Button, DaUa, Empty, H1, Loading, Muted, Surface } from '@/components/ui';
import { useLibrary, useSaved } from '@/lib/content';
import { grammarContent, grammarExamples, useGrammarSaved, useToggleGrammarSaved } from '@/lib/grammar';
import { space, useTheme } from '@/theme';

export default function Saved() {
  const { c } = useTheme();
  const lib = useLibrary();
  const saved = useSaved();
  const grammarSaved = useGrammarSaved();
  const toggleGrammar = useToggleGrammarSaved();
  const savedExamples = grammarExamples.filter((example) => grammarSaved.data?.includes(example.id));
  const savedTopics = grammarContent.topics.filter((topic) => grammarSaved.data?.includes(`topic:${topic.id}`));
  const items = (saved.data ?? []).flatMap((s) => {
    const src = s.kind === 'phrase' ? lib.data?.phrases.find((p) => p.id === s.item_id) : lib.data?.messages.find((m) => m.id === s.item_id);
    return src ? [{ ...s, src }] : [];
  });
  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <HeartIcon size={30} color={c.accent} weight="fill" />
          <H1>Мої збережені фрази</H1>
        </View>
        <Muted>Фрази, приклади й теми, які реально можуть знадобитися саме вам. Вони збережені у вашому акаунті.</Muted>
      </Section>
      <Section>
        {saved.isLoading || lib.isLoading || grammarSaved.isLoading ? (
          <Loading />
        ) : items.length === 0 && savedExamples.length === 0 && savedTopics.length === 0 ? (
          <Empty icon={HeartIcon} title="Поки що порожньо">
            Натисніть «Зберегти» біля будь-якої фрази або готового повідомлення, і вона з’явиться тут.
          </Empty>
        ) : items.length > 0 ? (
          <View style={{ gap: space(3) }}>
            {items.map(({ kind, item_id, src }) => (
              <Surface key={`${kind}-${item_id}`} style={{ gap: space(3), padding: space(4) }}>
                {kind === 'message' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ChatCircleTextIcon size={16} color={c.muted} />
                    <Muted style={{ fontSize: 14 }}>Готове повідомлення</Muted>
                  </View>
                ) : null}
                <DaUa da={src.da} ua={src.ua} size="md" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <SaveButton kind={kind} id={item_id} />
                  <Link href={{ pathname: '/chapter/[id]', params: { id: String(src.chapter_id) } }} asChild>
                    <Button variant="ghost" icon={ArrowRightIcon} label={`Розділ ${src.chapter_id}`} />
                  </Link>
                </View>
              </Surface>
            ))}
          </View>
        ) : null}
      </Section>
      {savedTopics.length > 0 || savedExamples.length > 0 ? (
        <Section>
          <Muted>Граматика</Muted>
          <View style={{ gap: space(3), maxWidth: 760 }}>
            {savedTopics.map((topic) => (
              <Surface key={topic.id} style={{ gap: space(3) }}>
                <Muted>Тема {topic.id}</Muted>
                <Link href={{ pathname: '/grammar/[id]', params: { id: topic.id } }} asChild>
                  <Button label={topic.title} icon={ArrowRightIcon} />
                </Link>
              </Surface>
            ))}
            {savedExamples.map((example) => (
              <Surface key={example.id} style={{ gap: space(3) }}>
                <DaUa da={example.da} ua={example.ua} size="md" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <Button label="Зняти збереження" icon={HeartIcon} onPress={() => toggleGrammar.mutate(example.id)} disabled={toggleGrammar.isPending} />
                  <Link href={{ pathname: '/grammar/[id]', params: { id: example.topicId } }} asChild>
                    <Button label={`Тема ${example.topicId}`} icon={ArrowRightIcon} />
                  </Link>
                </View>
              </Surface>
            ))}
          </View>
        </Section>
      ) : null}
    </Screen>
  );
}
