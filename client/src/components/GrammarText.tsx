import { EyeIcon, EyeSlashIcon, HeartIcon } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { AudioButton } from '@/components/AudioButton';
import { Spark } from '@/components/effects/Spark';
import { grammarExample, useGrammarSaved, useToggleGrammarSaved } from '@/lib/grammar';
import { fonts, radius, space, useTheme } from '@/theme';
import { Body, Button, Flag, H2, H3 } from './ui';

function inline(value: string): ReactNode[] {
  return value.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <Text key={index} style={{ fontFamily: fonts.bold }}>{part.slice(2, -2)}</Text>
    ) : (
      part.replace(/  $/, '')
    ),
  );
}

// A Danish example from the grammar text: the same card language as the
// chapter phrases (flag, Danish first, translation on request).
function ExampleCard({ da, ua, id }: { da: string; ua: string; id: string }) {
  const { c } = useTheme();
  const [show, setShow] = useState(false);
  const saved = useGrammarSaved();
  const toggle = useToggleGrammarSaved();
  const isSaved = saved.data?.includes(id) ?? false;
  return (
    <View style={{ gap: space(3), maxWidth: 720, padding: space(4), borderRadius: radius.card, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, boxShadow: `0 18px 36px -26px ${c.shadow}` }}>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row' }}>
          <Flag lang="da" />
          <Text selectable style={{ flex: 1, fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, color: c.ink }}>{da}</Text>
        </View>
        {show ? (
          <View style={{ flexDirection: 'row' }}>
            <Flag lang="ua" />
            <Text selectable style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24, color: c.ua }}>{ua}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <AudioButton text={da} />
        <Button label={show ? 'Сховати переклад' : 'Переклад'} icon={show ? EyeSlashIcon : EyeIcon} aria-expanded={show} onPress={() => setShow(!show)} />
        <Spark color={c.accent}>
          <Button
            label={isSaved ? 'Збережено' : 'Зберегти'}
            icon={HeartIcon}
            iconWeight={isSaved ? 'fill' : 'regular'}
            variant={isSaved ? 'active' : 'secondary'}
            disabled={saved.isLoading || toggle.isPending}
            aria-pressed={isSaved}
            onPress={() => toggle.mutate(id)}
          />
        </Spark>
      </View>
    </View>
  );
}

export function GrammarText({ text, topicId }: { text: string; topicId?: string }) {
  const { c } = useTheme();
  const blocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return (
    <View style={{ gap: space(4), maxWidth: 760 }}>
      {blocks.map((block, index) => {
        const example = topicId ? grammarExample(block, topicId, index) : null;
        if (example) return <ExampleCard key={index} {...example} />;
        if (block === '---') return <View key={index} style={{ height: 1, backgroundColor: c.line, marginVertical: space(2), maxWidth: 720 }} />;
        const heading = block.match(/^(#{1,3})\s+(.+)$/);
        if (heading) return heading[1].length <= 2 ? <H2 key={index} style={{ marginTop: space(4) }}>{heading[2]}</H2> : <H3 key={index} style={{ marginTop: space(2) }}>{heading[2]}</H3>;
        if (block.startsWith('> ')) {
          return (
            <View key={index} style={{ borderLeftWidth: 3, borderLeftColor: c.info, backgroundColor: c.infoSoft, borderTopRightRadius: radius.inner, borderBottomRightRadius: radius.inner, padding: space(4) }}>
              <Body>{inline(block.replace(/^>\s?/gm, '').replace(/  \n/g, '\n'))}</Body>
            </View>
          );
        }
        if (/^(?:\d+\.|[-*])\s/m.test(block) && block.split('\n').every((line) => /^(?:\d+\.|[-*])\s|^\s+|^$/.test(line))) {
          return (
            <View key={index} style={{ gap: space(2) }}>
              {block.split('\n').filter(Boolean).map((line, lineIndex) => (
                <Body key={lineIndex}>{inline(line.replace(/^[-*]\s+/, '• ').trim())}</Body>
              ))}
            </View>
          );
        }
        if (block.startsWith('❌') || block.startsWith('✅')) {
          return (
            <View key={index} style={{ gap: space(2) }}>
              {block.split('\n').filter(Boolean).map((line, lineIndex) => (
                <Body key={lineIndex} style={{ color: line.startsWith('❌') ? c.bad : line.startsWith('✅') ? c.ok : c.ink, fontFamily: fonts.semibold }}>
                  {inline(line.trim())}
                </Body>
              ))}
            </View>
          );
        }
        return <Body key={index} style={{ maxWidth: 720 }}>{inline(block.replace(/  \n/g, '\n'))}</Body>;
      })}
    </View>
  );
}
