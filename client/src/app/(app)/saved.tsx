import { Link } from 'expo-router';
import { ArrowRightIcon, ChatCircleTextIcon, HeartIcon } from 'phosphor-react-native';
import { View } from 'react-native';

import { SaveButton } from '@/components/book';
import { Screen, Section } from '@/components/Screen';
import { Button, DaUa, Empty, H1, Loading, Muted, Surface } from '@/components/ui';
import { useLibrary, useSaved } from '@/lib/content';
import { space, useTheme } from '@/theme';

export default function Saved() {
  const { c } = useTheme();
  const lib = useLibrary();
  const saved = useSaved();
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
        <Muted>Фрази, які реально можуть знадобитися саме вам. Вони збережені у вашому акаунті.</Muted>
      </Section>
      <Section>
        {saved.isLoading || lib.isLoading ? (
          <Loading />
        ) : items.length === 0 ? (
          <Empty icon={HeartIcon} title="Поки що порожньо">
            Натисніть «Зберегти» біля будь-якої фрази або готового повідомлення, і вона з’явиться тут.
          </Empty>
        ) : (
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
        )}
      </Section>
    </Screen>
  );
}
